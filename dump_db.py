from app import app, db
from models import VoiceSample, GeneratedAudio
import os

def dump_db():
    with app.app_context():
        print(f"DATABASE URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print("--- Voice Samples ---")
        samples = VoiceSample.query.all()
        if not samples:
            print("No voice samples found.")
        for s in samples:
            print(f"ID: {s.id}, Persona: {s.persona_name}, Voice ID: {s.elevenlabs_voice_id}, Active: {s.is_active}")
            
        print("\n--- Generated Audio ---")
        audio = GeneratedAudio.query.order_by(GeneratedAudio.created_at.desc()).limit(5).all()
        if not audio:
            print("No generated audio found.")
        for a in audio:
            exists = os.path.exists(a.audio_file_path)
            size = os.path.getsize(a.audio_file_path) if exists else 0
            print(f"ID: {a.id}, Path: {a.audio_file_path}, Exists: {exists}, Size: {size} bytes")

if __name__ == "__main__":
    dump_db()
