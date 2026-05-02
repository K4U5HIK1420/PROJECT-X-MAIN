import os
import re
import shutil
import subprocess
import tempfile
from importlib.util import find_spec

try:
    import cv2
except ImportError:
    cv2 = None

try:
    from textblob import TextBlob
except ImportError:
    TextBlob = None

try:
    import whisper
except ImportError:
    whisper = None

model = None
whisper_load_attempted = False
DeepFace = None
deepface_load_attempted = False


def is_whisper_installed():
    return whisper is not None


def is_deepface_installed():
    return find_spec("deepface") is not None


def get_whisper_model():
    global model, whisper_load_attempted
    if model is not None:
        return model
    if whisper_load_attempted or whisper is None:
        return None

    whisper_load_attempted = True
    try:
        print("Loading Whisper model...")
        model = whisper.load_model("base")
        print("Whisper model loaded!")
    except Exception as e:
        print(f"Whisper unavailable, fallback mode enabled: {e}")
        model = None
    return model


def get_deepface_module():
    global DeepFace, deepface_load_attempted
    if DeepFace is not None:
        return DeepFace
    if deepface_load_attempted:
        return None

    deepface_load_attempted = True
    try:
        from deepface import DeepFace as DeepFaceModule

        DeepFace = DeepFaceModule
    except Exception as e:
        print(f"DeepFace unavailable, fallback mode enabled: {e}")
        DeepFace = None
    return DeepFace


def transcribe_video(video_path):
    whisper_model = get_whisper_model()
    if whisper_model is None:
        return "Fallback transcript: Interview transcription is unavailable in lightweight mode."

    temp_audio_path = None
    try:
        audio_input = video_path
        ffmpeg_path = shutil.which("ffmpeg")
        if ffmpeg_path:
            fd, temp_audio_path = tempfile.mkstemp(suffix=".wav")
            os.close(fd)
            command = [
                ffmpeg_path,
                "-y",
                "-i",
                video_path,
                "-vn",
                "-acodec",
                "pcm_s16le",
                "-ar",
                "16000",
                "-ac",
                "1",
                temp_audio_path,
            ]
            completed = subprocess.run(command, capture_output=True, text=True)
            if completed.returncode == 0 and os.path.exists(temp_audio_path):
                audio_input = temp_audio_path
            else:
                print(f"FFmpeg audio extraction failed: {completed.stderr}")

        result = whisper_model.transcribe(audio_input)
        transcript = (result.get("text") or "").strip()
        if transcript:
            return transcript
        return "Transcript could not be extracted clearly from the recording."
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return "Transcript extraction failed for this recording."
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


def analyze_video_faces(video_path):
    """
    Analyze facial expression if OpenCV and DeepFace are available.
    Otherwise return a safe fallback response so the app can still run.
    """
    deepface_module = get_deepface_module()
    if not video_path or cv2 is None or deepface_module is None:
        return {
            "facial_score": 70,
            "emotions": {"dominant_emotion": "Neutral", "confidence": 0.5},
            "feedback": "Facial analysis is running in fallback mode. Install OpenCV and DeepFace for full emotion detection."
        }

    print(f"Starting facial analysis on {video_path}...")
    cap = cv2.VideoCapture(video_path)
    emotions_list = []
    frame_rate = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_interval = int(frame_rate)
    current_frame = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if current_frame % frame_interval == 0:
            try:
                analysis = deepface_module.analyze(frame, actions=['emotion'], enforce_detection=False)
                if isinstance(analysis, list):
                    dominant_emotion = analysis[0]['dominant_emotion']
                    emotions_list.append(dominant_emotion)
                else:
                    emotions_list.append(analysis['dominant_emotion'])
            except Exception:
                pass

        current_frame += 1

    cap.release()

    if not emotions_list:
        return {
            "facial_score": 50,
            "emotions": {"dominant_emotion": "No Face Detected", "confidence": 0},
            "feedback": "Could not detect a face. Ensure good lighting."
        }

    emotion_counts = {e: emotions_list.count(e) for e in set(emotions_list)}
    dominant_emotion = max(emotion_counts, key=emotion_counts.get)
    positive_emotions = ["happy", "neutral", "surprise"]
    positive_count = sum(emotion_counts.get(e, 0) for e in positive_emotions)
    total_frames = len(emotions_list)
    facial_score = int((positive_count / total_frames) * 100)

    if dominant_emotion in ["fear", "sad"]:
        feedback = f"You looked mostly {dominant_emotion}. Try to smile and relax."
    elif dominant_emotion == "happy":
        feedback = "Great energy! You looked happy and confident."
    elif dominant_emotion == "neutral":
        feedback = "You maintained a calm, professional demeanor."
    else:
        feedback = f"Dominant expression was {dominant_emotion}. Work on eye contact."

    return {
        "facial_score": facial_score,
        "emotions": {
            "dominant_emotion": dominant_emotion.capitalize(),
            "confidence": round(positive_count / total_frames, 2)
        },
        "feedback": feedback
    }


def highlight_transcript_issues(transcript: str):
    if not transcript:
        return {"text": "", "issues": []}

    issues = []
    fillers = ["um", "uh", "umm", "like", "you know"]
    for filler in fillers:
        for match in re.finditer(r'\b' + re.escape(filler) + r'\b', transcript, re.IGNORECASE):
            issues.append({
                "type": "filler",
                "text": match.group(),
                "start": match.start(),
                "end": match.end(),
                "feedback": "Filler word"
            })

    for match in re.finditer(r'\b(\w+)\s+\1\b', transcript, re.IGNORECASE):
        issues.append({
            "type": "repetition",
            "text": match.group(),
            "start": match.start(),
            "end": match.end(),
            "feedback": "Repetition"
        })

    issues.sort(key=lambda x: x["start"])
    return {"text": transcript, "issues": issues}


def analyze_communication(transcript: str) -> dict:
    highlight_data = highlight_transcript_issues(transcript)
    failure_markers = (
        "Transcript extraction failed",
        "Transcript could not be extracted",
        "Fallback transcript",
    )
    if transcript and any(marker in transcript for marker in failure_markers):
        return {
            "score": 0,
            "clarity_feedback": "Transcription failed. Check microphone permissions, recording length, and audio quality.",
            "sentiment": "Neutral",
            "transcript_analysis": highlight_data
        }

    if not transcript:
        return {
            "score": 0,
            "clarity_feedback": "No speech.",
            "sentiment": "Neutral",
            "transcript_analysis": highlight_data
        }

    issue_count = len(highlight_data['issues'])
    final_score = max(50, 100 - (issue_count * 5))

    if TextBlob is not None:
        try:
            blob = TextBlob(transcript)
            sentiment = "Positive" if blob.sentiment.polarity > 0 else "Neutral"
        except Exception:
            sentiment = "Neutral"
    else:
        sentiment = "Neutral"

    return {
        "score": final_score,
        "clarity_feedback": "Good clarity." if final_score > 80 else "Reduce filler words.",
        "sentiment": sentiment,
        "transcript_analysis": highlight_data
    }


def calculate_employability_score(profile, interview):
    return int((profile * 0.6) + (interview * 0.4))
