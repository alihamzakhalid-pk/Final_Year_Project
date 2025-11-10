import re
from datetime import datetime
from collections import defaultdict

def parse_chat_file(content):
    """
    Robust WhatsApp chat parser that handles multiple formats and special characters.
    Supports various date formats and system messages.
    """
    # Remove BOM (Byte Order Mark) if present at the start
    if content.startswith('\ufeff'):
        content = content[1:]
    
    # Remove any other invisible unicode characters at the start
    content = content.lstrip('\u200b\u200c\u200d\ufeff')
    
    # Common WhatsApp date/time patterns
    # Supports formats like:
    # [DD/MM/YYYY, HH:MM:SS] Name: Message
    # DD/MM/YYYY, HH:MM - Name: Message
    # DD/MM/YY, HH:MM AM/PM - Name: Message
    # M/D/YY, H:MM AM/PM - Name: Message
    patterns = [
        # Pattern 1: [DD/MM/YYYY, HH:MM:SS] or [DD/MM/YY, HH:MM:SS]
        r'^\[?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*[-–—]?\s*([^:]+?):\s*(.*)$',
        # Pattern 2: DD/MM/YYYY, HH:MM - Name: Message (without brackets)
        r'^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—]\s*([^:]+?):\s*(.*)$',
        # Pattern 3: More flexible format
        r'^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—:]\s*([^:]+?):\s*(.*)$',
    ]
    
    messages_by_person = defaultdict(list)
    current_message = None
    lines = content.split('\n')
    
    # System messages to ignore (localized versions)
    system_keywords = [
        'Messages and calls are end-to-end encrypted',
        'created group',
        'added',
        'removed',
        'left',
        'changed the subject',
        'changed this group',
        'security code changed',
        'joined using this group',
        'image omitted',
        'video omitted',
        'audio omitted',
        'sticker omitted',
        'document omitted',
        'GIF omitted',
        'Contact card omitted',
        'You deleted this message',
        'This message was deleted',
        'missed voice call',
        'missed video call',
        '<Media omitted>',
        'null',
    ]
    
    def is_system_message(text):
        """Check if a message is a system message"""
        text_lower = text.lower().strip()
        return any(keyword.lower() in text_lower for keyword in system_keywords)
    
    def clean_message(text):
        """Clean and normalize message text"""
        # Remove extra whitespace
        text = ' '.join(text.split())
        # Remove common artifacts
        text = text.strip()
        return text
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Try to match with any of the patterns
        matched = False
        for pattern in patterns:
            match = re.match(pattern, line)
            if match:
                date_str, time_str, sender, message = match.groups()
                
                # Clean sender name (remove extra spaces, special chars)
                sender = sender.strip().replace('\u202a', '').replace('\u202c', '')
                
                # Clean message
                message = clean_message(message)
                
                # Skip empty messages or system messages
                if not message or is_system_message(message) or not sender:
                    matched = True
                    current_message = None
                    break
                
                # Skip if sender name looks like a system message
                if any(keyword.lower() in sender.lower() for keyword in ['whatsapp', 'security', 'encryption']):
                    matched = True
                    current_message = None
                    break
                
                # Valid message found
                current_message = {
                    'sender': sender,
                    'message': message
                }
                messages_by_person[sender].append(message)
                matched = True
                break
        
        # If no pattern matched, it might be a continuation of previous message
        if not matched and current_message:
            # Append to the last message (multi-line message)
            continuation = clean_message(line)
            if continuation and not is_system_message(continuation):
                messages_by_person[current_message['sender']][-1] += ' ' + continuation
    
    # Filter out participants with too few messages (likely system or errors)
    MIN_MESSAGES = 3
    filtered_messages = {
        person: msgs 
        for person, msgs in messages_by_person.items() 
        if len(msgs) >= MIN_MESSAGES and person.strip()
    }
    
    # Additional validation: remove participants with suspicious names
    final_messages = {}
    for person, msgs in filtered_messages.items():
        # Skip names that are too short or contain only numbers/special chars
        if len(person.strip()) >= 2 and not person.replace('+', '').replace('-', '').isdigit():
            final_messages[person] = msgs
    
    # Get unique participants
    participants = list(final_messages.keys())
    
    # Raise error if not enough participants
    if len(participants) < 2:
        if len(participants) == 0:
            raise ValueError("No valid messages found in the chat file. Please ensure it's a valid WhatsApp export.")
        else:
            raise ValueError("Chat must have at least 2 participants.")
    
    return {
        'messages_by_person': final_messages,
        'participants': participants
    }


# Test function for debugging
def test_parser(sample_text):
    """Helper function to test the parser"""
    try:
        result = parse_chat_file(sample_text)
        print(f"✅ Parsed successfully!")
        print(f"Found {len(result['participants'])} participants:")
        for person in result['participants']:
            print(f"  - {person}: {len(result['messages_by_person'][person])} messages")
        return result
    except Exception as e:
        print(f"❌ Parse error: {e}")
        return None