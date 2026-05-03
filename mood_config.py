"""
Mood Configuration Module
Defines mood types, system prompts, and response modifiers for mood-dependent chat
"""

import json
from typing import Dict, Any

# Mood definitions with their characteristics
MOOD_CONFIG = {
    "natural": {
        "name": "Natural",
        "emoji": "😐",
        "color": "#6B7280",
        "description": "Balanced, normal conversation tone",
        "system_prompt_modifier": """
        Respond in a natural, balanced way. Use normal punctuation and language patterns.
        Be conversational but not overly enthusiastic or emotional.
        """,
        "response_modifiers": {
            "emoji_density": "normal",
            "sentence_length": "normal",
            "formality": "normal",
            "punctuation": "normal"
        }
    },
    "happy": {
        "name": "Happy",
        "emoji": "😊",
        "color": "#F59E0B",
        "description": "Cheerful, positive, and energetic responses",
        "system_prompt_modifier": """
        Respond with enthusiasm and positivity.
        Be cheerful, encouraging, and upbeat.
        Use friendly and lively language, and add positive emojis when appropriate.
        Avoid sounding neutral or serious.
        """,
        "response_modifiers": {
            "emoji_density": "high",
            "sentence_length": "short",
            "formality": "casual",
            "punctuation": "exclamation_heavy"
        }
    },
    "sad": {
        "name": "Sad",
        "emoji": "😢",
        "color": "#3B82F6",
        "description": "Empathetic, comforting, and supportive responses",
        "system_prompt_modifier": """
        Respond with empathy and understanding. Be gentle, supportive, and comforting.
        Listen actively and show that you care about their feelings.
        Use comforting language and avoid being too cheerful or dismissive.
        """,
        "response_modifiers": {
            "emoji_density": "low",
            "sentence_length": "normal",
            "formality": "warm",
            "punctuation": "gentle"
        }
    }
} 

def get_mood_config(mood: str) -> Dict[str, Any]:
    """Get configuration for a specific mood"""
    return MOOD_CONFIG.get(mood, MOOD_CONFIG["natural"])

def get_all_moods() -> Dict[str, Dict[str, Any]]:
    """Get all available moods"""
    return MOOD_CONFIG

def build_mood_aware_prompt(base_prompt: str, mood: str) -> str:
    """Build a system prompt that incorporates mood modifiers"""
    mood_config = get_mood_config(mood)

    mood_modifier = mood_config["system_prompt_modifier"].strip()

    # MOOD FIRST - Put mood instruction at the VERY TOP with strong enforcement
    mood_instruction = f"""CURRENT MOOD: {mood.upper()}
You MUST respond in {mood} mood. This overrides everything else.
{mood_modifier}

"""

    # Combine mood instruction FIRST, then base persona prompt below it
    full_prompt = f"""{mood_instruction}

{base_prompt}"""

    return full_prompt

def get_mood_emoji(mood: str) -> str:
    """Get emoji for a mood"""
    return get_mood_config(mood)["emoji"]

def get_mood_color(mood: str) -> str:
    """Get color for a mood"""
    return get_mood_config(mood)["color"]

def get_mood_name(mood: str) -> str:
    """Get display name for a mood"""
    return get_mood_config(mood)["name"]

def validate_mood(mood: str) -> bool:
    """Validate if a mood is supported"""
    return mood in MOOD_CONFIG