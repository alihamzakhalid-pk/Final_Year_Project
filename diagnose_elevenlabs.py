import os
from dotenv import load_dotenv
from elevenlabs import set_api_key, voices, generate, save

def diagnose():
    load_dotenv()
    api_key = os.environ.get('ELEVENLABS_API_KEY')
    
    print(f"--- ElevenLabs Diagnosis ---")
    if not api_key:
        print("[ERROR] ELEVENLABS_API_KEY not found in .env")
        return

    print(f"[OK] API Key found: {api_key[:4]}...{api_key[-4:]}")
    set_api_key(api_key)

    try:
        print("Fetching available voices...")
        available_voices = voices()
        print(f"[OK] Successfully fetched {len(available_voices)} voices.")
        
        # List first 3 voices
        for v in available_voices[:3]:
            print(f"  - {v.name} ({v.voice_id})")

    except Exception as e:
        print(f"[ERROR] Error fetching voices: {e}")
        return

    try:
        print("\nTesting TTS generation (cloned voice)...")
        audio = generate(
            text="This is a test of your cloned voice Hamza.",
            voice="VXyAF9zaSU69pKlCtylH",
            model="eleven_multilingual_v2"
        )
        
        if audio:
            print(f"[OK] Successfully generated {len(audio)} bytes of audio.")
            
            # Try to save it
            test_file = "test_diag_audio.mp3"
            with open(test_file, 'wb') as f:
                f.write(audio)
            print(f"[OK] Saved test audio to {test_file}")
            
            if os.path.exists(test_file) and os.path.getsize(test_file) > 0:
                print(f"[OK] Confirmation: {test_file} exists and is non-empty.")
                os.remove(test_file)
                print(f"   (Cleaned up {test_file})")
            else:
                print(f"[ERROR] {test_file} reached disk but is empty or missing.")
        else:
            print("[ERROR] Generated audio is empty (0 bytes).")

    except Exception as e:
        print(f"[ERROR] Error during TTS generation: {e}")

if __name__ == "__main__":
    diagnose()
