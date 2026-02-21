import re
from datetime import datetime
from collections import defaultdict

def parse_chat_file(content):
    """
    Robust WhatsApp chat parser that handles multiple formats and special characters.
    Supports various date formats and system messages.
    """
    # 1. Clean overall content
    # Remove BOM (Byte Order Mark) if present at the start
    if content.startswith('\ufeff'):
        content = content[1:]
    
    # Remove any other invisible unicode characters at the start of the file
    content = content.lstrip('\u200b\u200c\u200d\ufeff\u200e\u200f')
    
    # regex patterns for WhatsApp headers
    # We include [\u200e\u200f]? at the start to handle directional marks common in mobile exports
    patterns = [
        # Pattern 1: [DD/MM/YYYY, HH:MM:SS] or [DD/MM/YY, HH:MM:SS] (iOS style)
        r'^[\u200e\u200f]?\[(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]\s*([^:]+?):\s*(.*)$',
        # Pattern 2: DD/MM/YYYY, HH:MM - Name: Message (Android style)
        r'^[\u200e\u200f]?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—]\s*([^:]+?):\s*(.*)$',
        # Pattern 3: Flexible format for other variations
        r'^[\u200e\u200f]?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—:]\s*([^:]+?):\s*(.*)$',
    ]
    
    messages_by_person = defaultdict(list)
    current_message = None
    lines = content.split('\n')
    
    # System messages to ignore
    system_keywords = [
        'Messages and calls are end-to-end encrypted',
        'created group', 'added', 'removed', 'left',
        'changed the subject', 'security code changed',
        'joined using this group', 'image omitted',
        'video omitted', 'audio omitted', 'sticker omitted',
        'document omitted', 'GIF omitted', '<Media omitted>',
        'missed voice call', 'missed video call',
        'You deleted this message', 'This message was deleted'
    ]
    
    def is_system_message(text):
        text_lower = text.lower().strip()
        return any(keyword.lower() in text_lower for keyword in system_keywords)
    
    def clean_text(text):
        """Remove control characters and normalize whitespace"""
        if not text: return ""
        # Remove LRM, RLM, and other invisible chars
        text = text.replace('\u200e', '').replace('\u200f', '').replace('\u200b', '')
        return ' '.join(text.split()).strip()

    for line in lines:
        # Pre-clean the line of invisible marks that break regex anchors
        clean_line = line.strip().lstrip('\u200e\u200f\u200b\ufeff')
        if not clean_line:
            continue
        
        matched = False
        for pattern in patterns:
            # We use re.match with the cleaned line
            match = re.match(pattern, clean_line)
            if not match:
                # Try pattern without leading anchor in case of weird whitespace/marks
                match = re.search(pattern, clean_line)
                
            if match:
                date_str, time_str, sender, message = match.groups()
                
                # Clean sender and message
                sender = clean_text(sender)
                message = clean_text(message)
                
                if not message or is_system_message(message) or not sender:
                    matched = True
                    current_message = None
                    break
                
                # Skip system senders
                if any(k in sender.lower() for k in ['whatsapp', 'security', 'encryption']):
                    matched = True
                    current_message = None
                    break
                
                current_message = {'sender': sender, 'message': message}
                messages_by_person[sender].append(message)
                matched = True
                break
        
        # Continuation of previous message
        if not matched and current_message:
            continuation = clean_text(line)
            if continuation and not is_system_message(continuation):
                messages_by_person[current_message['sender']][-1] += ' ' + continuation
    
    # Filter participants
    participants = [p for p, m in messages_by_person.items() if len(m) >= 2]
    final_messages = {p: messages_by_person[p] for p in participants}
    
    if len(participants) < 2:
        if not participants:
            raise ValueError("No valid messages found. Please ensure this is a standard WhatsApp .txt export.")
        else:
            raise ValueError(f"Only found one participant: {participants[0]}. Chat must have at least 2 people.")
    
    return {
        'messages_by_person': final_messages,
        'participants': participants
    }
    
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