"""OAuth authentication handlers for multiple providers"""
import requests
import urllib.parse
import random
import string
from flask import session, current_app
from models import db, User

def get_app():
    """Get the Flask app instance"""
    try:
        return current_app._get_current_object()
    except RuntimeError:
        # If we're not in a request context, import app directly
        from app import app as flask_app
        return flask_app

def get_oauth_auth_url(provider):
    """Get OAuth authorization URL for a provider"""
    app = get_app()
    providers = {
        'google': {
            'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth',
            'scope': 'openid email profile',
            'client_id': app.config.get('GOOGLE_CLIENT_ID')
        },
        'facebook': {
            'auth_url': 'https://www.facebook.com/v18.0/dialog/oauth',
            'scope': 'email',
            'client_id': app.config.get('FACEBOOK_CLIENT_ID')
        },
        'microsoft': {
            'auth_url': 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            'scope': 'openid email profile',
            'client_id': app.config.get('MICROSOFT_CLIENT_ID')
        },
        'github': {
            'auth_url': 'https://github.com/login/oauth/authorize',
            'scope': 'user:email',
            'client_id': app.config.get('GITHUB_CLIENT_ID')
        }
    }
    
    if provider not in providers:
        return None
    
    provider_config = providers[provider]
    client_id = provider_config['client_id']
    
    if not client_id:
        return None
    
    # Generate state for CSRF protection
    state = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    session[f'oauth_state_{provider}'] = state
    
    # Build redirect URI - allow explicit override for Google, otherwise derive from host
    from flask import request
    if provider == 'google' and app.config.get('GOOGLE_REDIRECT_URI'):
        redirect_uri = app.config['GOOGLE_REDIRECT_URI']
    else:
        redirect_uri = f"{request.host_url.rstrip('/')}/api/oauth/{provider}/callback"
    
    # Build authorization URL
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': provider_config['scope'],
        'response_type': 'code',
        'state': state
    }
    
    if provider == 'microsoft':
        params['response_mode'] = 'query'
    
    auth_url = f"{provider_config['auth_url']}?{urllib.parse.urlencode(params)}"
    
    return auth_url

def exchange_oauth_code(provider, code, redirect_uri):
    """Exchange OAuth code for access token and get user info"""
    app = get_app()
    token_urls = {
        'google': 'https://oauth2.googleapis.com/token',
        'facebook': 'https://graph.facebook.com/v18.0/oauth/access_token',
        'microsoft': 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        'github': 'https://github.com/login/oauth/access_token'
    }
    
    client_secrets = {
        'google': (app.config.get('GOOGLE_CLIENT_ID'), app.config.get('GOOGLE_CLIENT_SECRET')),
        'facebook': (app.config.get('FACEBOOK_CLIENT_ID'), app.config.get('FACEBOOK_CLIENT_SECRET')),
        'microsoft': (app.config.get('MICROSOFT_CLIENT_ID'), app.config.get('MICROSOFT_CLIENT_SECRET')),
        'github': (app.config.get('GITHUB_CLIENT_ID'), app.config.get('GITHUB_CLIENT_SECRET'))
    }
    
    if provider not in token_urls:
        return None
    
    client_id, client_secret = client_secrets[provider]
    if not client_id or not client_secret:
        return None
    
    # Exchange code for token; allow explicit redirect override for Google
    if provider == 'google' and app.config.get('GOOGLE_REDIRECT_URI'):
        redirect_uri_override = app.config['GOOGLE_REDIRECT_URI']
    else:
        redirect_uri_override = redirect_uri

    token_data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_uri_override
    }
    
    if provider in ['google', 'microsoft', 'github']:
        token_data['grant_type'] = 'authorization_code'
    
    headers = {'Accept': 'application/json'} if provider == 'github' else {}
    
    try:
        response = requests.post(token_urls[provider], data=token_data, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"Token exchange failed for {provider}: {response.text}")
            return None
        
        token_response = response.json()
        access_token = token_response.get('access_token')
        
        if not access_token:
            return None
        
        # Get user info
        user_info = get_user_info(provider, access_token)
        return user_info
    except Exception as e:
        print(f"Error exchanging OAuth code for {provider}: {str(e)}")
        return None

def get_user_info(provider, access_token):
    """Get user information from OAuth provider"""
    user_info_urls = {
        'google': 'https://www.googleapis.com/oauth2/v2/userinfo',
        'facebook': 'https://graph.facebook.com/v18.0/me?fields=id,name,email',
        'microsoft': 'https://graph.microsoft.com/v1.0/me',
        'github': 'https://api.github.com/user'
    }
    
    headers = {'Authorization': f'Bearer {access_token}'}
    if provider == 'github':
        headers['Accept'] = 'application/json'
    
    try:
        user_response = requests.get(user_info_urls[provider], headers=headers, timeout=10)
        
        if user_response.status_code != 200:
            print(f"User info fetch failed for {provider}: {user_response.text}")
            return None
        
        user_data = user_response.json()
        
        # Normalize user data
        if provider == 'google':
            return {
                'id': user_data.get('id'),
                'email': user_data.get('email'),
                'name': user_data.get('name'),
                'picture': user_data.get('picture')
            }
        elif provider == 'facebook':
            # Get email separately if not in initial response
            email = user_data.get('email')
            if not email:
                try:
                    email_response = requests.get(
                        f"https://graph.facebook.com/v18.0/me?fields=email&access_token={access_token}",
                        timeout=10
                    )
                    if email_response.status_code == 200:
                        email_data = email_response.json()
                        email = email_data.get('email')
                except:
                    pass
            return {
                'id': user_data.get('id'),
                'email': email,
                'name': user_data.get('name'),
                'picture': user_data.get('picture', {}).get('data', {}).get('url') if user_data.get('picture') else None
            }
        elif provider == 'microsoft':
            return {
                'id': user_data.get('id'),
                'email': user_data.get('mail') or user_data.get('userPrincipalName'),
                'name': user_data.get('displayName'),
                'picture': None
            }
        elif provider == 'github':
            # Get email separately
            email = user_data.get('email')
            if not email:
                try:
                    email_response = requests.get('https://api.github.com/user/emails', headers=headers, timeout=10)
                    if email_response.status_code == 200:
                        emails = email_response.json()
                        primary_email = next((e for e in emails if e.get('primary')), emails[0] if emails else None)
                        email = primary_email.get('email') if primary_email else None
                except:
                    pass
            return {
                'id': str(user_data.get('id')),
                'email': email,
                'name': user_data.get('name') or user_data.get('login'),
                'picture': user_data.get('avatar_url')
            }
    except Exception as e:
        print(f"Error getting user info for {provider}: {str(e)}")
        return None
    
    return None

def generate_username(candidate: str) -> str:
    """Generate a unique username from a candidate string"""
    import re
    base = candidate.strip() or 'user'
    base = re.sub(r'[^a-zA-Z0-9]+', '-', base).strip('-').lower() or 'user'
    username = base
    counter = 1
    while User.query.filter_by(username=username).first():
        username = f"{base}{counter}"
        counter += 1
    return username

def get_or_create_oauth_user(provider, user_info):
    """Get existing user or create new user from OAuth info"""
    email = user_info.get('email')
    oauth_id = user_info.get('id')
    name = user_info.get('name') or (email.split('@')[0] if email else 'user')
    
    if not email or not oauth_id:
        return None
    
    # Check if user exists with this OAuth provider
    user = User.query.filter_by(oauth_provider=provider, oauth_id=str(oauth_id)).first()
    
    if user:
        return user
    
    # Check if user exists with this email (link accounts)
    user = User.query.filter_by(email=email).first()
    if user:
        # Link OAuth to existing account
        user.oauth_provider = provider
        user.oauth_id = str(oauth_id)
        db.session.commit()
        return user
    
    # Create new user
    username = generate_username(name)
    user = User(
        username=username,
        email=email,
        oauth_provider=provider,
        oauth_id=str(oauth_id),
        password_hash=None  # OAuth users don't have passwords
    )
    
    # Auto-promote Admin
    from app import app
    if email == app.config.get('ADMIN_EMAIL'):
        user.is_admin = True
        print(f"[OAUTH] Auto-promoting {email} to Admin during OAuth creation")

    db.session.add(user)
    db.session.commit()
    
    return user

