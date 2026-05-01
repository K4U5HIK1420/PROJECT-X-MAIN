from __future__ import annotations

import re
from pathlib import Path

from docx import Document
from docx.enum.text import WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.shared import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "PROJECT_X_Academic_Report_FINAL__codexcopy.docx"
OUT = ROOT / "PROJECT_X_Academic_Report_FINAL__toc_fixed.docx"

SUBTOPIC_RE = re.compile(r"^\s*(\d+\.\d+)\s+(.+?)\s+(\d+(?:-\d+)?)\s*$")


def normalize(text: str) -> str:
    return text.replace("\t", " ").replace("\xa0", " ")


def main() -> None:
    doc = Document(SRC)

    in_toc = False
    updated = 0

    for para in doc.paragraphs:
        raw = para.text
        text = normalize(raw).strip()

        if text == "TABLE OF CONTENTS":
            in_toc = True
            continue

        if in_toc and text == "LIST OF TABLES":
            break

        if not in_toc or not text:
            continue

        match = SUBTOPIC_RE.match(text)
        if not match:
            continue

        section_no, title, page_no = match.groups()

        para.paragraph_format.tab_stops.clear_all()
        para.paragraph_format.tab_stops.add_tab_stop(
            Inches(6.1),
            alignment=WD_TAB_ALIGNMENT.RIGHT,
            leader=WD_TAB_LEADER.DOTS,
        )
        para.paragraph_format.left_indent = Pt(18)
        para.paragraph_format.first_line_indent = Pt(0)

        for run in para.runs:
            run.text = ""

        para.runs[0].text = f"{section_no} {title}\t{page_no}"
        updated += 1

    doc.save(OUT)
    print(f"Updated {updated} TOC subtopic entries")
    print(f"Saved: {OUT}")


if __name__ == "__main__":
    main()
