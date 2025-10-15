import re
from collections import defaultdict
import json

def parse_chat_file(chat_text):
    """
    Parse WhatsApp chat exported string.
    Works for various formats:
    - "dd/mm/yyyy, h:mm am/pm - Name: Message"
    - Handles <Media omitted>, emojis, multiple spaces, non-breaking spaces
    - Fallbacks for lines without proper timestamp
    Returns:
        {
            'participants': [{'name': str, 'count': int}],  # top 2 by messages
            'messages_by_person': {name: [msg1, msg2, ...]}
        }
    """
    lines = chat_text.strip().split('\n')
    messages_by_person = defaultdict(list)
    
    # Flexible pattern: date, time, am/pm, dash, sender, message
    """ pattern = re.compile(
        r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s*'     # date
        r'(\d{1,2}:\d{2}(?:[:\d{2}]?)?)\s*'   # time
        r'(AM|PM|am|pm|a\.m\.|p\.m\.)?\s*-\s*' # am/pm optional
        r'([^:]+?):\s*'                        # sender
        r'(.*)$',                               # message
        re.IGNORECASE
    )

    pattern = re.compile(
    r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s*'     # date
    r'(\d{1,2}:\d{2}(?:[:\d{2}]?)?)\s*'   # time
    r'(AM|PM|am|pm|a\.m\.|p\.m\.)?\s*-\s*' # am/pm optional
    r'([^:]+?):\s*'                        # sender
    r'(.*)$',                               # message
    re.IGNORECASE
    )"""

    pattern = re.compile(
        r'^\[(\d{1,2}/\d{1,2}/\d{2,4}),\s*'   # [date,
        r'(\d{1,2}:\d{2}(?::\d{2})?)\s*'      # h:mm or h:mm:ss (optional seconds)
        r'(AM|PM)?\]\s*'                     # optional AM/PM]
        r'([^:]+?):\s*'                      # sender:
        r'(.*)$',                             # message
        re.IGNORECASE
    )

    

    current_sender = None
    current_message = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        match = pattern.match(line)
        if match:
            # Save previous message
            if current_sender:
                full_message = "\n".join(current_message).strip()
                if full_message or full_message == "<Media omitted>":
                    messages_by_person[current_sender].append(full_message)
            
            # Start new message
            current_sender = match.group(4).strip()
            current_message = [match.group(5).strip()]
        else:
            # Continuation of previous message
            if current_sender:
                current_message.append(line)

    # Save last message
    if current_sender:
        full_message = "\n".join(current_message).strip()
        if full_message or full_message == "<Media omitted>":
            messages_by_person[current_sender].append(full_message)

    # Must have at least 2 participants
    if len(messages_by_person) < 2:
        raise ValueError("Chat must have at least 2 participants.")

    # Top 2 participants by message count
    sorted_participants = sorted(
        messages_by_person.items(),
        key=lambda x: len(x[1]),
        reverse=True
    )[:2]
    participants = [{'name': name, 'count': len(msgs)} for name, msgs in sorted_participants]

    with open("new.txt", 'w', encoding='utf-8') as f:
            json.dump( {
        'participants': participants,
        'messages_by_person': messages_by_person  # all messages preserved
    }, f, ensure_ascii=False, indent=4)
       
    print(f"\nChat data saved  in current directory.")

    return {
        'participants': participants,
        'messages_by_person': messages_by_person  # all messages preserved
    }

