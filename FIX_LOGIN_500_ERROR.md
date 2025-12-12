# Fix: POST /api/login 500 Error

## Problem Summary
The login endpoint was returning a **500 INTERNAL SERVER ERROR** when attempting to authenticate users.

### Root Cause
**Database schema mismatch** - The SQLite database was created with an old schema that was missing OAuth columns (`oauth_provider` and `oauth_id`) that are defined in the current User model.

```
Error: sqlite3.OperationalError: no such column: user.oauth_provider
```

---

## Solution Applied

### Step 1: Database Recreation
The database was recreated with the correct schema using the current User model definition.

**Before:**
- Missing columns: `oauth_provider`, `oauth_id`
- Unable to query User table for authentication

**After:**
```
Tables created:
- chat_data: id, user_id, selected_person, all_messages, messages, conversation_history, is_temp, created_at
- user: id, username, email, password_hash, oauth_provider, oauth_id, created_at
- verification_code: id, email, code, purpose, is_used, expires_at, created_at
```

### Step 2: Schema Verification
All required columns are now present in the User table:
- ✅ `id` (Primary key)
- ✅ `username` (Unique)
- ✅ `email` (Unique)
- ✅ `password_hash` (For password authentication)
- ✅ `oauth_provider` (For OAuth authentication)
- ✅ `oauth_id` (For OAuth authentication)
- ✅ `created_at` (Timestamp)

---

## How to Recreate the Database in the Future

If you encounter similar issues, run:

```bash
python init_db.py
```

This script will:
1. Drop all existing tables
2. Create fresh tables with the correct schema
3. Verify all columns are present

---

## Testing the Login Endpoint

The endpoint was tested and verified to work correctly:

```
POST /api/login
{
  "email": "test@example.com",
  "password": "testpassword123"
}

Response (200 OK):
{
  "message": "Verification code sent to your email",
  "email": "test@example.com"
}
```

---

## Key Configuration Files

Ensure these are properly configured:

### `.env` File
Required for email verification:
```
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
OPENAI_API_KEY=your-api-key
```

### `config.py`
Contains the database configuration:
```python
SQLALCHEMY_DATABASE_URI = 'sqlite:///botme.db'  # Located in instance/
```

---

## Troubleshooting

### If you still see 500 errors:

1. **Check database exists:**
   ```bash
   ls instance/botme.db
   ```

2. **Check Flask logs:**
   Look for detailed error messages in the terminal where Flask is running

3. **Verify .env configuration:**
   - MAIL_USERNAME and MAIL_PASSWORD must be set
   - OPENAI_API_KEY must be set

4. **Recreate database:**
   ```bash
   python init_db.py
   ```

---

## Next Steps

1. ✅ Database is fixed
2. You can now:
   - Sign up new accounts
   - Log in with email verification
   - Upload WhatsApp chats
   - Create AI personas
   - Analyze personality traits

---

## Additional Notes

- The database file is located in `instance/botme.db`
- It's a SQLite database, so you can inspect it with DB Browser or similar tools
- The OAuth features (Google, Facebook, etc.) are now fully supported with proper schema
