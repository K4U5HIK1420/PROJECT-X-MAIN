import re

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

try:
    from deepface import DeepFace
except ImportError:
    DeepFace = None


model = None
if whisper is not None:
    try:
        print("Loading Whisper model...")
        model = whisper.load_model("base")
        print("Whisper model loaded!")
    except Exception as e:
        print(f"Whisper unavailable, fallback mode enabled: {e}")
        model = None


def transcribe_video(video_path):
    if model is None:
        return "Fallback transcript: Interview transcription is unavailable in lightweight mode."

    try:
        result = model.transcribe(video_path)
        transcript = (result.get("text") or "").strip()
        if transcript:
            return transcript
        return "Transcript could not be extracted clearly from the recording."
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return "Transcript extraction failed for this recording."


def analyze_video_faces(video_path):
    """
    Analyze facial expression if OpenCV and DeepFace are available.
    Otherwise return a safe fallback response so the app can still run.
    """
    if not video_path or cv2 is None or DeepFace is None:
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
                analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
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
