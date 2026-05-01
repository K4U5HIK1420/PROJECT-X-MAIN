from __future__ import annotations

from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "PROJECT_X_Academic_Report_v2.docx"
OUT = ROOT / "PROJECT_X_Academic_Report_FINAL.docx"


def delete_paragraph(paragraph) -> None:
    element = paragraph._element
    parent = element.getparent()
    if parent is not None:
        parent.remove(element)


def main() -> None:
    doc = Document(SRC)

    exact_delete = {
        "APPENDIX C",
        "CHAPTER-WISE FIGURE CAPTIONS FOR FINAL SCREENSHOT INSERTION",
        "Figure B.1 Profile Analysis Screen",
        "Figure B.2 Recommended Domain and Skill Gap Output",
        "Figure B.3 Live Mock Interview Recording Screen",
        "Figure B.4 Interview Performance Feedback Screen",
        "Figure B.5 Mentor Chat Interface",
        "Figure B.6 University Dashboard View",
        "Figure B.7 Downloaded Interview PDF Report",
        "Screenshot Capture Checklist",
        "Suggested Screenshot Order for Final Report",
    }

    startswith_delete = (
        "Where running screenshots are not embedded directly into this draft",
        "This screenshot should show the profile input interface",
        "This screenshot should capture the result after successful profile analysis",
        "This image should show the camera preview",
        "This screenshot should show the employability score",
        "This snapshot should display the mentor chat window",
        "This screenshot should capture the administrative dashboard card",
        "If possible, insert an image or first page preview",
        "This appendix has been added for final report preparation",
        "Figure 3.1: Problem context of PROJECT-X",
        "Figure 3.2: Comparison between the existing fragmented guidance process",
        "Figure 4.1: Overall architecture of PROJECT-X",
        "Figure 4.2: Data flow for profile analysis",
        "Figure 4.3: Interview analytics flow",
        "Figure 5.1: Main navigation interface of the PROJECT-X frontend",
        "Figure 5.2: Student profile analysis page used to submit resume text",
        "Figure 5.3: Recommended domain and skill-gap output generated",
        "Figure 5.4: Live mock interview screen showing webcam preview",
        "Figure 5.5: Interview feedback screen displaying employability score",
        "Figure 5.6: Virtual mentor chat interface showing context-aware guidance",
        "Figure 5.7: Prototype university dashboard presenting batch-level readiness",
        "Figure 6.1: Consolidated interpretation of system outputs",
        "Figure B.1: Profile analysis screen prepared for final insertion",
        "Figure B.2: Skill-gap output screen prepared for final insertion",
        "Figure B.3: Mock interview recording screen prepared for final insertion",
        "Figure B.4: Interview feedback screen prepared for final insertion",
        "Figure B.5: Mentor guidance screen prepared for final insertion",
        "Figure B.6: University dashboard screen prepared for final insertion",
        "1. Application home/profile page before analysis.",
        "2. Profile analysis result with recommended domain and missing skills.",
        "3. Live mock interview screen while recording.",
        "4. Interview feedback screen after evaluation.",
        "5. Mentor chat with at least one meaningful reply visible.",
        "6. University dashboard summary card.",
        "7. Downloaded interview PDF first page.",
    )

    for p in list(doc.paragraphs):
        text = p.text.strip()
        if not text:
            continue

        if text in exact_delete or any(text.startswith(prefix) for prefix in startswith_delete):
            delete_paragraph(p)
            continue

        if text.startswith("Before final printing, the document should still be polished"):
            p.text = (
                "Before final printing, the document should be reviewed once for updated page numbers, "
                "table-of-contents fields, and institutional details such as roll numbers and signatures."
            )
            continue

        if text == "OUTPUT SCREENS AND SNAPSHOT DESCRIPTIONS":
            p.text = "OUTPUT SCREENS"
            continue

        if text == "Figure B.1: Generated PDF interview report summarizing the candidate’s interview evaluation.":
            p.text = "Figure B.1: Generated PDF interview report summarizing the candidate's interview evaluation."
            continue

    doc.save(OUT)
    print(f"Saved final report to: {OUT}")


if __name__ == "__main__":
    main()
