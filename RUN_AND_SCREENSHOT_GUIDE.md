# PROJECT-X Run Guide

## 1. Backend

Use the fresh runtime environment:

```powershell
cd C:\Users\hp\Desktop\PROJECT-X-main\backend
..\runtime-venv\Scripts\python.exe app.py
```

Expected:

- Flask starts on `http://127.0.0.1:5000`
- Readiness route: `http://127.0.0.1:5000/api/v1/readiness`
- Analytics route: `http://127.0.0.1:5000/api/v1/session_analytics`

Optional setup:

- Copy `backend\.env.example` to `backend\.env`
- Set `GEMINI_API_KEY` if you want real mentor responses

## 2. Frontend

In a second terminal:

```powershell
cd C:\Users\hp\Desktop\PROJECT-X-main\frontend
npm start
```

Expected:

- React opens on `http://localhost:3000`
- Frontend calls the backend at `http://127.0.0.1:5000/api/v1`

## 3. Presentation flow

1. Open the `Profile` screen.
2. Paste resume/project text.
3. Click `Analyze Profile & Skills`.
4. Show recommended domain, extracted skills, missing skills, and roadmap.
5. Open `Interview`.
6. Record a 20-40 second answer with camera and microphone enabled.
7. Click `Evaluate Performance`.
8. Show the live progress stages while analysis runs.
9. Show the final interview score, employability score, transcript review, and PDF download.
10. Open `Mentor` and ask a question if `GEMINI_API_KEY` is configured.
11. Open `Dashboard` to show real session analytics and readiness status.

## 4. What is real right now

- Profile analysis
- Skill extraction
- Career recommendation
- Roadmap generation
- Live webcam/audio recording
- Whisper transcription
- OpenCV + DeepFace readiness
- Interview scoring
- PDF interview report
- Session analytics dashboard

## 5. What still needs configuration

- `GEMINI_API_KEY` for real mentor API responses
- Good camera lighting for better facial analysis

## 6. Suggested demo resume text

```text
Computer science student with experience in Python, React, JavaScript, HTML, CSS, SQL, Docker, PostgreSQL, TensorFlow, and scikit-learn. Built full-stack student platforms and machine learning projects. Interested in frontend engineering and AI-enabled software systems. Strong communication, teamwork, and project execution skills.
```
