import os
import tempfile
import threading
import uuid
from collections import Counter

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

load_dotenv()

import interview_analyzer
import data_processor
from data_processor import simple_resume_parser
from interview_analyzer import (
    analyze_communication,
    analyze_video_faces,
    calculate_employability_score,
    transcribe_video,
)
from ml_models import (
    CareerClassifier,
    MOCK_JOB_REQUIREMENTS,
    analyze_skill_gap,
    generate_career_roadmap,
    get_ai_readiness,
    virtual_mentor_response,
)
from report_generator import generate_interview_report

app = Flask(__name__)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "").strip()
if frontend_origin:
    allowed_origins = [origin.strip() for origin in frontend_origin.split(",") if origin.strip()]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})
else:
    CORS(app)

career_classifier = CareerClassifier()
career_classifier.train_model()

processing_jobs = {}
session_state = {
    "profiles_analyzed": 0,
    "interviews_completed": 0,
    "mentor_messages": 0,
    "domains": Counter(),
    "missing_skills": Counter(),
    "profile_scores": [],
    "interview_scores": [],
    "employability_scores": [],
}


def update_job(job_id, **changes):
    if job_id in processing_jobs:
        processing_jobs[job_id].update(changes)


def record_profile_analytics(analysis_payload):
    session_state["profiles_analyzed"] += 1
    recommended = (analysis_payload.get("career_recommendations") or ["Unknown"])[0]
    session_state["domains"][recommended] += 1

    profile_score = analysis_payload.get("profile_match_percentage")
    if isinstance(profile_score, (int, float)):
        session_state["profile_scores"].append(profile_score)

    for skill in analysis_payload.get("skill_gap_analysis", {}).get("missing_skills", []):
        session_state["missing_skills"][skill] += 1


def record_interview_analytics(result_payload):
    session_state["interviews_completed"] += 1

    interview_score = result_payload.get("interview_score")
    employability_score = result_payload.get("employability_score")

    if isinstance(interview_score, (int, float)):
        session_state["interview_scores"].append(interview_score)
    if isinstance(employability_score, (int, float)):
        session_state["employability_scores"].append(employability_score)


def build_session_analytics():
    def average(values):
        if not values:
            return 0
        return round(sum(values) / len(values), 1)

    top_domain = session_state["domains"].most_common(1)
    top_skill_gap = session_state["missing_skills"].most_common(1)

    return {
        "profiles_analyzed": session_state["profiles_analyzed"],
        "interviews_completed": session_state["interviews_completed"],
        "mentor_messages": session_state["mentor_messages"],
        "average_profile_match": average(session_state["profile_scores"]),
        "average_interview_score": average(session_state["interview_scores"]),
        "average_employability_score": average(session_state["employability_scores"]),
        "top_recommended_domain": top_domain[0][0] if top_domain else "No data yet",
        "top_skill_gap": {
            "skill": top_skill_gap[0][0] if top_skill_gap else "No data yet",
            "count": top_skill_gap[0][1] if top_skill_gap else 0,
        },
    }


def build_readiness_payload():
    ai_readiness = get_ai_readiness()
    return {
        "backend_status": "online",
        "resume_parser": {
            "spacy_loaded": data_processor.nlp is not None,
        },
        "interview_analysis": {
            "whisper_loaded": interview_analyzer.is_whisper_installed(),
            "opencv_available": interview_analyzer.cv2 is not None,
            "deepface_available": interview_analyzer.is_deepface_installed(),
            "textblob_available": interview_analyzer.TextBlob is not None,
        },
        "mentor_chat": ai_readiness,
        "session_analytics": build_session_analytics(),
    }


def process_interview_job(job_id, video_path, profile_match_percentage=None, audio_path=None, transcript_hint=""):
    try:
        update_job(job_id, status="processing", stage="Transcribing interview", progress=25)
        transcript_source_path = audio_path or video_path
        transcript = transcribe_video(transcript_source_path)
        failure_markers = (
            "Transcript extraction failed",
            "Transcript could not be extracted",
            "Fallback transcript",
        )
        if transcript_hint and any(marker in transcript for marker in failure_markers):
            transcript = transcript_hint

        update_job(job_id, stage="Analyzing facial expressions", progress=55)
        facial_result = analyze_video_faces(video_path)

        update_job(job_id, stage="Scoring communication", progress=75)
        communication_result = analyze_communication(transcript)
        communication_result["full_transcript"] = transcript

        update_job(job_id, stage="Calculating final score", progress=90)
        interview_score = communication_result.get("score", 0)
        facial_score = facial_result.get("facial_score", 0)
        employability_score = (
            calculate_employability_score(profile_match_percentage, interview_score)
            if profile_match_percentage is not None
            else None
        )

        result = {
            "employability_score": employability_score,
            "profile_match_available": profile_match_percentage is not None,
            "profile_match_percentage": profile_match_percentage,
            "interview_score": interview_score,
            "communication_analysis": communication_result,
            "facial_analysis": facial_result,
        }
        record_interview_analytics(result)
        update_job(job_id, status="completed", stage="Completed", progress=100, result=result)
    except Exception as exc:
        update_job(
            job_id,
            status="failed",
            stage="Failed",
            progress=100,
            error=f"Interview processing failed: {exc}",
        )
    finally:
        if os.path.exists(video_path):
            os.remove(video_path)
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)


@app.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "running", "ml_backend": "online"})


@app.route("/api/v1/readiness", methods=["GET"])
def readiness():
    return jsonify(build_readiness_payload())


@app.route("/api/v1/session_analytics", methods=["GET"])
def session_analytics():
    return jsonify(build_session_analytics())


@app.route("/api/v1/analyze_profile", methods=["POST"])
def analyze_profile():
    data = request.json
    if not data or "resume_text" not in data:
        return jsonify({"error": "Please provide 'resume_text' in the request body."}), 400

    resume_text = data["resume_text"]
    parsed_data = simple_resume_parser(resume_text)
    student_skills = parsed_data["extracted_skills"]

    predicted_domains = career_classifier.predict_domain(resume_text) or ["Unknown"]
    target_domain = predicted_domains[0]
    required_skills = MOCK_JOB_REQUIREMENTS.get(target_domain, [])

    gap_analysis = analyze_skill_gap(required_skills, student_skills) if required_skills else {
        "missing_skills": [],
        "matched_skills": [],
        "completeness_percentage": 0,
    }
    gap_analysis["target_role"] = target_domain
    gap_analysis["required_skills"] = required_skills

    result = {
        "message": "Profile analyzed successfully.",
        "student_data": parsed_data or {},
        "career_recommendations": predicted_domains,
        "skill_gap_analysis": gap_analysis,
        "profile_match_percentage": gap_analysis.get("completeness_percentage", 0),
        "career_roadmap": generate_career_roadmap(
            target_domain,
            gap_analysis.get("completeness_percentage", 0),
            gap_analysis.get("missing_skills", []),
        ),
    }
    record_profile_analytics(result)
    return jsonify(result)


@app.route("/api/v1/career_roadmap", methods=["POST"])
def career_roadmap():
    data = request.json or {}
    domain = data.get("domain", "Unknown")
    employability_score = float(data.get("employability_score", 0))
    missing_skills = data.get("missing_skills", [])
    return jsonify(generate_career_roadmap(domain, employability_score, missing_skills))


@app.route("/api/v1/interview_sessions", methods=["POST"])
def create_interview_session():
    if "video" not in request.files:
        return jsonify({"error": "No video file received"}), 400

    job_id = uuid.uuid4().hex
    fd, temp_path = tempfile.mkstemp(prefix=f"projectx_{job_id}_", suffix=".webm")
    os.close(fd)
    request.files["video"].save(temp_path)

    audio_temp_path = None
    if "audio" in request.files:
        audio_fd, audio_temp_path = tempfile.mkstemp(prefix=f"projectx_audio_{job_id}_", suffix=".webm")
        os.close(audio_fd)
        request.files["audio"].save(audio_temp_path)

    processing_jobs[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "stage": "Upload received",
        "progress": 10,
        "result": None,
        "error": None,
    }

    raw_profile_match = request.form.get("profile_match_percentage")
    try:
        profile_match_percentage = float(raw_profile_match) if raw_profile_match not in (None, "") else None
    except ValueError:
        profile_match_percentage = None
    transcript_hint = (request.form.get("transcript_hint") or "").strip()

    worker = threading.Thread(
        target=process_interview_job,
        args=(job_id, temp_path, profile_match_percentage, audio_temp_path, transcript_hint),
        daemon=True,
    )
    worker.start()

    return jsonify(processing_jobs[job_id]), 202


@app.route("/api/v1/interview_sessions/<job_id>", methods=["GET"])
def get_interview_session(job_id):
    job = processing_jobs.get(job_id)
    if not job:
        return jsonify({"error": "Interview session not found"}), 404
    return jsonify(job)


@app.route("/api/v1/mock_facial_interview", methods=["POST"])
def mock_facial_interview():
    if "video" not in request.files:
        return jsonify({"error": "No video file received"}), 400

    fd, temp_path = tempfile.mkstemp(prefix="projectx_sync_", suffix=".webm")
    os.close(fd)
    request.files["video"].save(temp_path)

    try:
        transcript = transcribe_video(temp_path)
        facial_result = analyze_video_faces(temp_path)
        comm_result = analyze_communication(transcript)
        comm_result["full_transcript"] = transcript
        raw_profile_match = request.form.get("profile_match_percentage")
        try:
            profile_match_percentage = float(raw_profile_match) if raw_profile_match not in (None, "") else None
        except ValueError:
            profile_match_percentage = None

        result = {
            "employability_score": (
                calculate_employability_score(profile_match_percentage, comm_result.get("score", 0))
                if profile_match_percentage is not None
                else None
            ),
            "profile_match_available": profile_match_percentage is not None,
            "profile_match_percentage": profile_match_percentage,
            "interview_score": comm_result.get("score", 0),
            "communication_analysis": comm_result,
            "facial_analysis": facial_result,
        }
        record_interview_analytics(result)
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": f"Processing failed: {exc}"}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.route("/api/v1/mock_interview", methods=["POST"])
def mock_interview():
    data = request.json
    if not data or "transcript" not in data or "profile_match_percentage" not in data:
        return jsonify({"error": "Please provide 'transcript' and 'profile_match_percentage' (as a number)."}), 400

    transcript = data["transcript"]
    try:
        profile_match_percentage = float(data["profile_match_percentage"])
    except ValueError:
        return jsonify({"error": "'profile_match_percentage' must be a valid number."}), 400

    facial_result = analyze_video_faces(video_path=None)
    communication_result = analyze_communication(transcript)
    interview_score = int(round((facial_result["facial_score"] + communication_result["score"]) / 2, 0))
    employability_score = calculate_employability_score(profile_match_percentage, interview_score)

    result = {
        "message": "Interview analyzed successfully.",
        "interview_score": interview_score,
        "employability_score": employability_score,
        "facial_analysis": facial_result,
        "communication_analysis": communication_result,
    }
    record_interview_analytics(result)
    return jsonify(result)


@app.route("/api/v1/mentor_chat", methods=["POST"])
def mentor_chat():
    data = request.json
    if not data or "query" not in data or "domain" not in data:
        return jsonify({"error": "Please provide 'query' and 'domain'."}), 400

    response = virtual_mentor_response(
        query=data["query"],
        domain=data["domain"],
        employability_score=data.get("employability_score", 0),
        missing_skills=data.get("missing_skills", []),
    )
    session_state["mentor_messages"] += 1

    return jsonify({"mentor_response": response})


@app.route("/api/v1/interview_report", methods=["POST"])
def interview_report():
    data = request.json or {}
    pdf_path = generate_interview_report(data)
    return send_file(pdf_path, as_attachment=True, download_name="AI_Interview_Report.pdf")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", debug=False, port=port, threaded=True, use_reloader=False)
