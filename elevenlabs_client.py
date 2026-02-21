"""
ElevenLabs TTS Client
Handles communication with ElevenLabs API for voice cloning and TTS generation.
"""
import os
from typing import Optional, Dict, List, Union
from elevenlabs import Voice, VoiceSettings, save, generate, voices, clone, set_api_key
from config import Config

class ElevenLabsClient:
    """Client for interacting with ElevenLabs API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize ElevenLabs client
        
        Args:
            api_key: ElevenLabs API key. If None, uses Config.ELEVENLABS_API_KEY
        """
        self.api_key = api_key or os.environ.get('ELEVENLABS_API_KEY')
        if not self.api_key:
            print("⚠️ Warning: No ElevenLabs API key found in environment variables")
        else:
            set_api_key(self.api_key)
            
    def clone_voice(self, name: str, description: str, audio_files: List[str]) -> Dict:
        """
        Clone a voice from audio samples
        
        Args:
            name: Name of the voice
            description: Description of the voice
            audio_files: List of paths to audio files
            
        Returns:
            dict: Created voice object (id, name, etc.)
        """
        try:
            # Note: 'clone' returns a Voice object
            voice = clone(
                name=name,
                description=description,
                files=audio_files,
            )
            return {
                'voice_id': voice.voice_id,
                'name': voice.name,
                'category': voice.category,
            }
        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower():
                raise Exception("ElevenLabs quota exceeded. Please check your plan limits.")
            if "invalid api key" in error_msg.lower():
                raise Exception("Invalid ElevenLabs API Key. Please check your Render environment variables.")
            raise Exception(f"ElevenLabs cloning error: {error_msg}")

    def generate_tts(self, text: str, voice_id: str) -> bytes:
        """
        Generate speech from text
        
        Args:
            text: Text to convert to speech
            voice_id: ID of the voice to use
            
        Returns:
            bytes: Audio content
        """
        try:
            # Generate audio using the multilingual model for Urdu support
            # Use specific settings for better clarity and stability
            audio = generate(
                text=text,
                voice=Voice(
                    voice_id=voice_id,
                    settings=VoiceSettings(
                        stability=0.5,
                        similarity_boost=0.8,
                        style=0.0,
                        use_speaker_boost=True
                    )
                ),
                model="eleven_multilingual_v2"
            )
            return audio
        except Exception as e:
            raise Exception(f"Failed to generate TTS: {str(e)}")

    def get_voices(self) -> List[Dict]:
        """
        Get all available voices
        
        Returns:
            list: List of voice dictionaries
        """
        try:
            all_voices = voices()
            return [
                {
                    'voice_id': v.voice_id,
                    'name': v.name,
                    'category': v.category
                }
                for v in all_voices
            ]
        except Exception as e:
            print(f"Failed to list voices: {str(e)}")
            return []

    def delete_voice(self, voice_id: str) -> bool:
        """
        Delete a voice
        
        Args:
            voice_id: Voice ID to delete
            
        Returns:
            bool: True if successful
        """
        try:
            # The SDK might not have a direct delete function exposed easily in top-level
            # We often need to use the API directly or voice object method
            from elevenlabs.api import Voice
            voice = Voice(voice_id=voice_id)
            voice.delete()
            return True
        except Exception as e:
            print(f"Failed to delete voice: {str(e)}")
            return False
