from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
import tempfile
import os
from datetime import datetime

def generate_interview_report(data):
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, "interview_report.pdf")

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "AI Mock Interview Report")

    y -= 30
    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Generated on: {datetime.now().strftime('%d %b %Y %H:%M')}")

    y -= 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, f"Employability Score: {data.get('employability_score', 'N/A')}")

    y -= 30
    c.setFont("Helvetica", 11)
    c.drawString(50, y, f"Sentiment: {data.get('communication_analysis', {}).get('sentiment')}")

    y -= 20
    c.drawString(50, y, f"Dominant Emotion: {data.get('facial_analysis', {}).get('emotions', {}).get('dominant_emotion')}")

    y -= 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Transcript:")

    y -= 20
    c.setFont("Helvetica", 10)
    communication_data = data.get("communication_analysis", {})
    transcript = (
        communication_data.get("full_transcript")
        or communication_data.get("transcript_analysis", {}).get("text")
        or "Transcript not available for this recording."
    )

    wrapped_lines = []
    for raw_line in transcript.split("\n"):
        wrapped_lines.extend(simpleSplit(raw_line, "Helvetica", 10, width - 100) or [""])

    for line in wrapped_lines:
        if y < 50:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 10)
        c.drawString(50, y, line)
        y -= 14

    c.save()
    return file_path
