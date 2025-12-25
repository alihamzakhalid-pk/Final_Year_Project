"""
Personality Analysis Module
Analyzes chat messages to extract personality insights, communication patterns, and behavioral traits.
"""
import re
import json
from collections import Counter, defaultdict
from datetime import datetime
import math

# Common stop words - English and Roman Urdu/Hindi
STOP_WORDS = {
    # English stop words
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
    'her', 'its', 'our', 'their', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now', 'then', 'here', 'there',
    'urdu', 'hindi', 'english',
    # Roman Urdu/Hindi stop words (common particles and auxiliaries)
    'ki', 'ka', 'ke', 'ko', 'se', 'mein', 'ne', 'hai', 'hain', 'ho', 'tha', 'the', 'thi', 
    'raha', 'rahi', 'rahe', 'gaya', 'gayi', 'gaye', 'ga', 'gi', 'ge', 'hoga', 'hogi', 'honge',
    'kya', 'kab', 'kahan', 'kaise', 'kyun', 'kis', 'kisi', 'kuch', 'kuchh', 'sab', 'sabhi',
    'yeh', 'ye', 'woh', 'wo', 'un', 'unka', 'unke', 'unki', 'uska', 'uske', 'uski', 'mera', 'mere', 'meri',
    'tera', 'tere', 'teri', 'hamara', 'hamare', 'hamari', 'tumhara', 'tumhare', 'tumhari',
    'apna', 'apne', 'apni', 'apko', 'aapko', 'mujhe', 'tujhe', 'unhe', 'usko', 'isko',
    'bhi', 'to', 'tu', 'main', 'tum', 'aap', 'hum', 'wo', 'ye', 'vo', 'unhein', 'unko',
    'agar', 'toh', 'phir', 'lekin', 'magar', 'par', 'aur', 'ya', 'yaa', 'nahi', 'na', 'nahin',
    'hota', 'hoti', 'hote', 'hona', 'hone', 'honi', 'kar', 'kare', 'kari', 'karo', 'karte', 'karti',
    'jab', 'tab', 'ab', 'yahan', 'wahan', 'idhar', 'udhar', 'kahan', 'kahin'
}

# Emoji patterns
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "]+", flags=re.UNICODE
)

# Positive/negative word lists - English and Roman Urdu/Hindi
POSITIVE_WORDS = {
    # English positive words
    'happy', 'great', 'good', 'nice', 'excellent', 'wonderful', 'amazing', 'awesome', 'fantastic',
    'love', 'like', 'enjoy', 'thanks', 'thank', 'appreciate', 'grateful', 'pleased', 'delighted',
    'smile', 'laugh', 'fun', 'excited', 'joy', 'pleasure', 'best', 'perfect', 'brilliant',
    'awesome', 'cool', 'sweet', 'lovely', 'beautiful', 'great', 'super', 'wow', 'yay',
    # Roman Urdu/Hindi positive words
    'accha', 'achha', 'mast', 'badiya', 'badhiya', 'khoob', 'khoobsurat', 'shukriya', 'shukria',
    'dhanyawad', 'pyar', 'mohabbat', 'mohabbatein', 'dil', 'khushi', 'khush', 'maza', 'mazay',
    'zabardast', 'zabardast', 'wah', 'wahh', 'wahh', 'wahhh', 'wahhhh', 'wahhh', 'wahhhh',
    'sahi', 'sahi hai', 'bilkul', 'bilkul sahi', 'theek', 'theek hai', 'perfect', 'perfect hai',
    'bohat', 'bahut', 'bahot', 'zyada', 'zyada accha', 'bohat accha', 'bohat zabardast',
    'love', 'luv', 'lovely', 'beautiful', 'cute', 'sweet', 'nice', 'good', 'great',
    'khush', 'khushi', 'maza', 'mazay', 'fun', 'enjoy', 'enjoying', 'enjoyed',
    'best', 'bestest', 'awesome', 'amazing', 'wonderful', 'fantastic', 'brilliant',
    'dil se', 'dil se shukriya', 'bohat shukriya', 'thank you', 'thanks', 'dhanyawad',
    'pyar', 'mohabbat', 'dil', 'dilbar', 'jaan', 'jaanu', 'mera jaan', 'meri jaan'
}

NEGATIVE_WORDS = {
    # English negative words
    'sad', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'angry', 'frustrated',
    'disappointed', 'worried', 'anxious', 'stress', 'tired', 'exhausted', 'sick', 'ill',
    'problem', 'issue', 'difficulty', 'trouble', 'error', 'mistake', 'wrong', 'fail',
    'upset', 'annoyed', 'irritated', 'depressed', 'unhappy', 'miserable', 'awful',
    # Roman Urdu/Hindi negative words
    'bura', 'bura hai', 'kharab', 'kharab hai', 'pareshan', 'pareshani', 'thak', 'thak gaya',
    'thak gayi', 'thak gaye', 'bimari', 'bemar', 'mushkil', 'mushkilat', 'problem', 'masla',
    'takleef', 'dukh', 'dard', 'gham', 'udaas', 'udaasi', 'khafa', 'naraz', 'narazgi',
    'gussa', 'gussay', 'angry', 'upset', 'sad', 'unhappy', 'worried', 'tension', 'tension hai',
    'problem hai', 'masla hai', 'mushkil hai', 'takleef hai', 'dukh hai', 'gham hai',
    'bura lag raha', 'kharab lag raha', 'accha nahi', 'theek nahi', 'sahi nahi',
    'nahi', 'na', 'no', 'not good', 'not nice', 'not happy', 'not well', 'not fine'
}


def extract_messages_from_chat(chat_data):
    """Extract and clean messages from ChatData object"""
    messages = []
    try:
        # Try to parse messages field (original WhatsApp messages)
        if chat_data.messages:
            msg_data = json.loads(chat_data.messages)
            if isinstance(msg_data, list):
                for msg in msg_data:
                    if isinstance(msg, dict):
                        # Handle dict format: {'message': '...'} or {'content': '...'}
                        text = msg.get('message', msg.get('content', ''))
                    elif isinstance(msg, str):
                        # Handle string format (most common)
                        text = msg
                    else:
                        # Fallback: convert to string
                        text = str(msg)
                    
                    if text and text.strip():
                        messages.append(text.strip())
            elif isinstance(msg_data, str):
                # If messages is a single string, split by newlines or use as-is
                if '\n' in msg_data:
                    messages = [m.strip() for m in msg_data.split('\n') if m.strip()]
                else:
                    messages = [msg_data.strip()] if msg_data.strip() else []
    except (json.JSONDecodeError, TypeError) as e:
        print(f"[PERSONALITY] Error extracting messages: {e}")
        # Try to use messages as plain text if JSON parsing fails
        if chat_data.messages:
            try:
                messages = [m.strip() for m in chat_data.messages.split('\n') if m.strip()]
            except:
                pass
    
    return messages


def calculate_avg_message_length(messages):
    """Calculate average message length in words"""
    if not messages:
        return 0
    total_words = sum(len(msg.split()) for msg in messages)
    return round(total_words / len(messages), 1)


def count_emojis(text):
    """Count emojis in text"""
    return len(EMOJI_PATTERN.findall(text))


def analyze_sentiment(messages):
    """Improved sentiment analysis with better word matching"""
    if not messages:
        return {'positive': 33, 'neutral': 34, 'negative': 33}
    
    positive_count = 0
    negative_count = 0
    neutral_count = 0
    
    for msg in messages:
        msg_lower = msg.lower()
        words_in_msg = set(re.findall(r'\b\w+\b', msg_lower))
        
        # Count word matches (using word boundaries for accuracy)
        positive_score = len(words_in_msg.intersection(POSITIVE_WORDS))
        negative_score = len(words_in_msg.intersection(NEGATIVE_WORDS))
        
        # Also check for common expressions
        if any(expr in msg_lower for expr in ['haha', 'lol', '😊', '❤️', '👍', '😂', 'mast', 'badiya']):
            positive_score += 1
        if any(expr in msg_lower for expr in ['😢', '😡', '😠', 'ugh', 'hate']):
            negative_score += 1
        
        if positive_score > negative_score:
            positive_count += 1
        elif negative_score > positive_score:
            negative_count += 1
        else:
            neutral_count += 1
    
    total = len(messages)
    
    return {
        'positive': round((positive_count / total) * 100, 1),
        'neutral': round((neutral_count / total) * 100, 1),
        'negative': round((negative_count / total) * 100, 1)
    }


def analyze_communication_style(messages):
    """Analyze communication style (casual vs formal) - supports English and Roman Urdu"""
    if not messages:
        return {'casual': 50, 'formal': 50}
    
    # Casual indicators - English and Roman Urdu
    casual_indicators = [
        # English casual
        'haha', 'lol', 'lmao', 'omg', 'wtf', 'btw', 'tbh', 'imo', 'idk', 'gonna', 'wanna',
        'ur', 'u', 'r', 'cuz', 'coz', 'yeah', 'yep', 'nope', 'nah', 'yup', 'k', 'ok', 'okay',
        'hmm', 'hehe', 'hihi', 'haha', 'lolz', 'rofl', 'lmaoo',
        # Roman Urdu casual
        'haha', 'hehe', 'hihi', 'lol', 'lolz', 'hahaha', 'hehehe', 'hihihi',
        'accha', 'achha', 'theek', 'sahi', 'bilkul', 'wah', 'wahh', 'wahhh',
        'mast', 'badiya', 'zabardast', 'wah', 'bohat', 'bahut', 'zyada',
        'yaar', 'yaara', 'dost', 'dosto', 'bhai', 'bhaiya', 'bhen', 'behen',
        'janu', 'jaan', 'dear', 'dearie', 'sweetie', 'honey',
        'kya', 'kya hai', 'kya kar rahe', 'kya kar rahi', 'kya kar raha',
        'kaise', 'kaise ho', 'kaise hai', 'kahan', 'kahan ho', 'kahan hai',
        # Emojis
        '😊', '😂', '❤️', '👍', '😍', '😎', '😄', '😃', '😁', '😆', '😅', '🤣', '😘', '🥰'
    ]
    
    # Formal indicators - English and Roman Urdu
    formal_indicators = [
        # English formal
        'please', 'thank you', 'regards', 'sincerely', 'respectfully', 'dear', 'sir', 'madam',
        'appreciate', 'grateful', 'kindly', 'would', 'could', 'should', 'shall',
        'apologize', 'apology', 'regret', 'respectfully', 'yours', 'yours sincerely',
        # Roman Urdu formal
        'shukriya', 'shukria', 'dhanyawad', 'aap', 'aapka', 'aapki', 'aapke',
        'aapko', 'aapse', 'aapne', 'meherbani', 'kripa', 'kripa karke',
        'kya aap', 'kya aapko', 'agar aap', 'aap se', 'aap ke', 'aap ki',
        'respect', 'respect karta', 'respect karti', 'respect karte',
        'namaste', 'adaab', 'salam', 'salaam', 'assalam o alaikum'
    ]
    
    casual_count = 0
    formal_count = 0
    
    for msg in messages:
        msg_lower = msg.lower()
        msg_casual = sum(1 for indicator in casual_indicators if indicator in msg_lower)
        msg_formal = sum(1 for indicator in formal_indicators if indicator in msg_lower)
        
        if msg_casual > msg_formal:
            casual_count += 1
        elif msg_formal > msg_casual:
            formal_count += 1
    
    total = len(messages)
    if total == 0:
        return {'casual': 50, 'formal': 50}
    
    casual_pct = round((casual_count / total) * 100, 1)
    formal_pct = round((formal_count / total) * 100, 1)
    
    # Normalize to 100%
    total_pct = casual_pct + formal_pct
    if total_pct > 0:
        casual_pct = round((casual_pct / total_pct) * 100, 1)
        formal_pct = round((formal_pct / total_pct) * 100, 1)
    else:
        casual_pct = 60  # Default to slightly casual
        formal_pct = 40
    
    return {'casual': casual_pct, 'formal': formal_pct}


def get_top_words(messages, n=10):
    """Get top N most used words (excluding stop words)"""
    word_counter = Counter()
    
    for msg in messages:
        # Extract words (alphanumeric + some special chars)
        words = re.findall(r'\b\w+\b', msg.lower())
        for word in words:
            if word not in STOP_WORDS and len(word) > 2:
                word_counter[word] += 1
    
    return [{'word': word, 'count': count} for word, count in word_counter.most_common(n)]


def get_emoji_frequency(messages):
    """Get emoji frequency"""
    emoji_counter = Counter()
    
    for msg in messages:
        emojis = EMOJI_PATTERN.findall(msg)
        for emoji in emojis:
            emoji_counter[emoji] += 1
    
    # Get top 5 emojis
    top_emojis = emoji_counter.most_common(5)
    return [{'emoji': emoji, 'count': count, 'name': get_emoji_name(emoji)} for emoji, count in top_emojis]


def get_emoji_name(emoji):
    """Simple emoji name mapping"""
    emoji_names = {
        '😊': 'smile', '❤️': 'heart', '👍': 'thumbs up', '😂': 'laughing',
        '😍': 'heart eyes', '😎': 'cool', '🙂': 'slightly smiling', '😁': 'grinning',
        '😉': 'winking', '😘': 'kiss', '🥰': 'smiling with hearts', '😋': 'yum',
        '🤗': 'hugging', '🤔': 'thinking', '😴': 'sleeping', '😢': 'crying',
        '😡': 'angry', '🤣': 'rolling on floor', '😅': 'sweat smile'
    }
    return emoji_names.get(emoji, 'emoji')


def calculate_vocabulary_richness(messages):
    """Calculate vocabulary richness (unique words / total words)"""
    if not messages:
        return 0
    
    all_words = []
    for msg in messages:
        words = re.findall(r'\b\w+\b', msg.lower())
        all_words.extend([w for w in words if w not in STOP_WORDS and len(w) > 2])
    
    if not all_words:
        return 0
    
    unique_words = len(set(all_words))
    total_words = len(all_words)
    
    return round((unique_words / total_words) * 100, 1) if total_words > 0 else 0


def estimate_personality_traits(messages):
    """Estimate Big Five personality traits based on message patterns - IMPROVED VERSION"""
    if not messages:
        return {
            'openness': 50,
            'conscientiousness': 50,
            'extraversion': 50,
            'agreeableness': 50,
            'emotional_stability': 50
        }
    
    total_messages = len(messages)
    
    # ========== OPENNESS ==========
    # Creative thinking, curiosity, imagination, variety in vocabulary
    creative_words = [
        'creative', 'imagine', 'idea', 'think', 'wonder', 'curious', 'explore', 'new', 'different',
        'innovative', 'unique', 'interesting', 'amazing', 'discover', 'learn', 'try',
        'soch', 'sochna', 'khayal', 'naya', 'alag', 'amazing', 'interesting', 'philosophy',
        'art', 'music', 'book', 'movie', 'film', 'story', 'dream', 'beautiful', 'khoobsurat'
    ]
    question_marks = sum(msg.count('?') for msg in messages)
    creative_matches = sum(1 for msg in messages if any(word in msg.lower() for word in creative_words))
    
    # Calculate vocabulary diversity as openness indicator
    all_words = []
    for msg in messages:
        words = re.findall(r'\b\w+\b', msg.lower())
        all_words.extend([w for w in words if w not in STOP_WORDS and len(w) > 2])
    vocab_diversity = len(set(all_words)) / max(len(all_words), 1) * 100
    
    openness_pct = (creative_matches / total_messages) * 100
    question_pct = min((question_marks / total_messages) * 20, 15)  # Cap at 15
    openness = 30 + (openness_pct * 2) + question_pct + (vocab_diversity * 0.3)
    openness = min(95, max(25, openness))
    
    # ========== CONSCIENTIOUSNESS ==========
    # Planning, organization, punctuality, completing tasks
    organized_words = [
        'plan', 'schedule', 'organize', 'prepare', 'complete', 'finish', 'done', 'ready',
        'time', 'deadline', 'task', 'work', 'submit', 'assignment', 'meeting', 'appointment',
        'taiyar', 'khatam', 'complete', 'ready', 'time', 'waqt', 'kal', 'tomorrow', 'today',
        'abhi', 'jaldi', 'late', 'on time', 'remind', 'remember', 'important', 'urgent'
    ]
    # Proper punctuation and capitalization indicates conscientiousness
    proper_punctuation = sum(1 for msg in messages if msg.rstrip().endswith(('.', '!', '?')))
    organized_matches = sum(1 for msg in messages if any(word in msg.lower() for word in organized_words))
    
    cons_pct = (organized_matches / total_messages) * 100
    punctuation_pct = (proper_punctuation / total_messages) * 100
    conscientiousness = 35 + (cons_pct * 2.5) + (punctuation_pct * 0.15)
    conscientiousness = min(95, max(25, conscientiousness))
    
    # ========== EXTRAVERSION ==========
    # Social engagement, enthusiasm, expressiveness
    social_words = [
        'friend', 'party', 'meet', 'together', 'fun', 'excited', 'happy', 'great', 'love',
        'hang out', 'going out', 'club', 'concert', 'event', 'gathering', 'everyone',
        'dost', 'yaar', 'yaara', 'sath', 'maza', 'mazay', 'khushi', 'khush', 'excited',
        'party', 'milna', 'milenge', 'mast', 'badiya', 'zabardast', 'wah', 'awesome',
        'haha', 'lol', 'hehe', 'rofl', 'lmao'
    ]
    exclamation_count = sum(msg.count('!') for msg in messages)
    emoji_count = sum(len(EMOJI_PATTERN.findall(msg)) for msg in messages)
    caps_words = sum(1 for msg in messages for word in msg.split() if word.isupper() and len(word) > 1)
    social_matches = sum(1 for msg in messages if any(word in msg.lower() for word in social_words))
    
    extra_pct = (social_matches / total_messages) * 100
    exclaim_pct = min((exclamation_count / total_messages) * 10, 20)  # Cap contribution
    emoji_pct = min((emoji_count / total_messages) * 8, 15)  # Cap contribution
    extraversion = 30 + (extra_pct * 2) + exclaim_pct + emoji_pct
    extraversion = min(95, max(20, extraversion))
    
    # ========== AGREEABLENESS ==========
    # Politeness, cooperation, empathy, kindness
    polite_words = [
        'please', 'thank', 'thanks', 'sorry', 'appreciate', 'help', 'support', 'care',
        'kind', 'nice', 'welcome', 'glad', 'sure', 'no problem', 'of course', 'happy to',
        'shukriya', 'shukria', 'dhanyawad', 'sorry', 'maaf', 'madad', 'help', 'zaroor',
        'bilkul', 'haan', 'ok', 'theek hai', 'koi baat nahi', 'np', 'np bro', 'sure'
    ]
    # Shorter responses can indicate agreeableness (accommodating, not argumentative)
    agreement_words = ['yes', 'ok', 'okay', 'sure', 'alright', 'haan', 'ji', 'theek', 'sahi', 'bilkul', 'zaroor']
    
    polite_matches = sum(1 for msg in messages if any(word in msg.lower() for word in polite_words))
    agreement_matches = sum(1 for msg in messages if any(word in msg.lower() for word in agreement_words))
    
    agree_pct = (polite_matches / total_messages) * 100
    agreement_pct = (agreement_matches / total_messages) * 100
    
    # Get sentiment for agreeableness
    sentiment = analyze_sentiment(messages)
    positive_boost = sentiment['positive'] * 0.3
    
    agreeableness = 35 + (agree_pct * 1.5) + (agreement_pct * 0.8) + positive_boost
    agreeableness = min(95, max(25, agreeableness))
    
    # ========== EMOTIONAL STABILITY (Neuroticism inverted) ==========
    # Calm, consistent, low anxiety/stress
    negative_emotion_words = [
        'sad', 'angry', 'upset', 'worried', 'stressed', 'anxious', 'nervous', 'frustrated',
        'annoyed', 'tired', 'exhausted', 'hate', 'terrible', 'awful', 'problem', 'issue',
        'dukh', 'gham', 'pareshan', 'tension', 'gussa', 'thak', 'mushkil', 'takleef',
        'bura', 'kharab', 'naraz', 'udaas', 'crying', 'cry'
    ]
    calm_words = [
        'calm', 'relax', 'peaceful', 'chill', 'easy', 'fine', 'good', 'great', 'okay',
        'no worries', 'all good', 'no problem', 'theek', 'sab theek', 'accha', 'mast'
    ]
    
    negative_matches = sum(1 for msg in messages if any(word in msg.lower() for word in negative_emotion_words))
    calm_matches = sum(1 for msg in messages if any(word in msg.lower() for word in calm_words))
    
    negative_pct = (negative_matches / total_messages) * 100
    calm_pct = (calm_matches / total_messages) * 100
    
    # High stability = low negative, high calm
    emotional_stability = 70 - (negative_pct * 1.5) + (calm_pct * 0.5)
    emotional_stability = min(95, max(20, emotional_stability))
    
    return {
        'openness': round(openness, 1),
        'conscientiousness': round(conscientiousness, 1),
        'extraversion': round(extraversion, 1),
        'agreeableness': round(agreeableness, 1),
        'emotional_stability': round(emotional_stability, 1)
    }


def analyze_personality(chat_data):
    """
    Main function to analyze personality from chat data
    Returns comprehensive personality analysis
    """
    messages = extract_messages_from_chat(chat_data)
    
    if not messages:
        # Return default/empty analysis
        return {
            'error': 'No messages found for analysis',
            'person_name': chat_data.selected_person or 'Unknown',
            'total_messages': 0
        }
    
    # Basic metrics
    avg_length = calculate_avg_message_length(messages)
    total_emojis = sum(count_emojis(msg) for msg in messages)
    emoji_usage = round((total_emojis / len(messages)) * 100, 1) if messages else 0
    
    # Communication style
    communication_style = analyze_communication_style(messages)
    
    # Sentiment analysis
    sentiment = analyze_sentiment(messages)
    
    # Vocabulary analysis
    vocabulary_richness = calculate_vocabulary_richness(messages)
    top_words = get_top_words(messages, 10)
    emoji_freq = get_emoji_frequency(messages)
    
    # Personality traits
    traits = estimate_personality_traits(messages)
    
    # Message length distribution
    length_distribution = []
    for msg in messages:
        word_count = len(msg.split())
        if word_count <= 5:
            length_distribution.append('1-5')
        elif word_count <= 10:
            length_distribution.append('6-10')
        elif word_count <= 15:
            length_distribution.append('11-15')
        elif word_count <= 20:
            length_distribution.append('16-20')
        else:
            length_distribution.append('21+')
    
    length_counts = Counter(length_distribution)
    length_data = [
        {'range': '1-5', 'count': length_counts.get('1-5', 0)},
        {'range': '6-10', 'count': length_counts.get('6-10', 0)},
        {'range': '11-15', 'count': length_counts.get('11-15', 0)},
        {'range': '16-20', 'count': length_counts.get('16-20', 0)},
        {'range': '21+', 'count': length_counts.get('21+', 0)},
    ]
    
    return {
        'person_name': chat_data.selected_person or 'Unknown',
        'total_messages': len(messages),
        'metrics': {
            'avg_message_length': avg_length,
            'emoji_usage': emoji_usage,
            'slang_usage': round(100 - communication_style['formal'], 1),
            'vocabulary_richness': vocabulary_richness,
            'sentence_complexity': round(vocabulary_richness * 0.8, 1)  # Simplified metric
        },
        'communication_style': communication_style,
        'sentiment': sentiment,
        'top_words': top_words,
        'emoji_frequency': emoji_freq,
        'message_length_distribution': length_data,
        'personality_traits': traits,
        'traits_radar': [
            {'trait': 'Openness', 'value': traits['openness'], 'fullMark': 100},
            {'trait': 'Conscientiousness', 'value': traits['conscientiousness'], 'fullMark': 100},
            {'trait': 'Extraversion', 'value': traits['extraversion'], 'fullMark': 100},
            {'trait': 'Agreeableness', 'value': traits['agreeableness'], 'fullMark': 100},
            {'trait': 'Emotional Stability', 'value': traits['emotional_stability'], 'fullMark': 100},
        ]
    }

