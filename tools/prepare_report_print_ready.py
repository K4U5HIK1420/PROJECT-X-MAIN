from __future__ import annotations

from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "PROJECT_X_Academic_Report_FINAL__toc_fixed.docx"
OUT = ROOT / "PROJECT_X_Academic_Report_FINAL__print_ready.docx"


def delete_paragraph(paragraph) -> None:
    element = paragraph._element
    parent = element.getparent()
    if parent is not None:
        parent.remove(element)


def main() -> None:
    doc = Document(SRC)

    exact_replacements = {
        "Figure 3.1 should present a problem context diagram showing the student at the center, surrounded by profile uncertainty, missing skills, interview anxiety, and lack of personalized guidance. Arrows should converge into the proposed system, which returns career suggestions, skill-gap output, interview feedback, and mentor advice.": (
            "The diagrams associated with this chapter summarize the problem context and the transition from fragmented guidance methods to a unified analytical platform. They support the written discussion by presenting the student problem space, the role of integrated feedback, and the relationship between system inputs and outcomes in a concise visual form."
        ),
        "Figure 3.2 should be a comparison diagram contrasting the existing fragmented system with the proposed integrated platform. The left side can show separate boxes for manual counselling, resume tools, and interview websites, while the right side shows a single unified platform handling all major tasks in one workflow.": (
            "Together, these visual summaries reinforce the requirement analysis by showing why an integrated architecture is academically meaningful: the proposed system combines profile analysis, interview review, mentor guidance, and reporting within one workflow instead of scattering them across disconnected tools."
        ),
        "4.12 BLUEPRINT FOR CHAPTER DIAGRAMS": "4.12 DIAGRAM INTERPRETATION",
        "For the final printed report, the architecture diagram should use clean rectangular blocks with left-to-right data movement. The frontend block should contain the four visible views, the backend block should contain route handlers, and the processing block should include parser, classifier, skill analyzer, interview analyzer, mentor engine, and PDF generator. A distinct infrastructure block should show PostgreSQL, Docker, and media devices.": (
            "The diagrams included in this chapter help translate the implementation into an academic design narrative. The architecture figure clarifies how the frontend, backend, processing modules, and supporting infrastructure interact, while the flow diagrams illustrate how profile analysis and interview analytics move from user input to interpretable output."
        ),
        "The data flow diagrams should avoid excessive visual clutter. Each should use the standard pattern of external entity, process, data store, and output arrow. Since the project is academic, readability is more important than artistic complexity. Labels should match the terms already used in the report so the narrative and diagrams reinforce one another.": (
            "These figures improve readability by complementing the textual explanation with a structured visual view of system behavior. They also strengthen the report from a submission perspective because they connect the codebase, algorithms, and user-facing workflow in a form that examiners can review quickly."
        ),
        "Where a screenshot is used instead of a drawn diagram, a short note can be added below the figure to explain that the figure is a running-system capture. This is especially appropriate for frontend views such as profile analysis, interview recording, and mentor chat.": (
            "Where interface screenshots are used alongside formal diagrams, they further demonstrate that the project is not merely conceptual but has been implemented as a working prototype with visible student-facing outputs."
        ),
        "Before final printing, the document should be reviewed once for updated page numbers, table-of-contents fields, and institutional details such as roll numbers and signatures.": "",
        "Once those steps are completed, the report will read more naturally as a finished student submission rather than as a draft assembled from mixed sources.": "",
        "• Figure B.1 Profile analysis screen placeholder": "• Figure B.1 Generated PDF interview report summary",
        "4.12 Blueprint for chapter diagrams\t40": "4.12 Diagram interpretation\t40",
    }

    exact_delete = {
        "• Figure B.2 Skill gap analysis result placeholder",
        "• Figure B.3 Live mock interview screen placeholder",
        "• Figure B.4 Interview feedback screen placeholder",
        "• Figure B.5 Mentor chat screen placeholder",
        "• Figure B.6 University dashboard screen placeholder",
    }

    for p in list(doc.paragraphs):
        text = p.text.strip()
        if not text:
            continue

        if text in exact_delete:
            delete_paragraph(p)
            continue

        if text in exact_replacements:
            replacement = exact_replacements[text]
            if replacement == "":
                delete_paragraph(p)
            else:
                p.text = replacement

    doc.save(OUT)
    print(f"Saved print-ready report to: {OUT}")


if __name__ == "__main__":
    main()
