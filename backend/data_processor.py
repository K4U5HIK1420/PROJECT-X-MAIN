import re
import spacy
from PyPDF2 import PdfReader

MODEL_NAME = "en_core_web_sm"

try:
    nlp = spacy.load(MODEL_NAME)
except OSError:
    try:
        import en_core_web_sm

        nlp = en_core_web_sm.load()
    except Exception:
        nlp = None

MOCK_SKILLS = [
    "Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript", "PHP", "Go", "Rust",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Material UI", "React", "Next.js", "Vue.js",
    "Angular", "Redux", "Node.js", "Express", "Flask", "FastAPI", "Django", "Spring Boot",
    "REST APIs", "GraphQL", "Microservices", "WebSockets",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis", "Firebase",
    "Docker", "Kubernetes", "Jenkins", "CI/CD", "Terraform", "Git", "GitHub", "Linux",
    "AWS", "Azure", "Google Cloud", "Cloud Computing", "Networking",
    "Machine Learning", "Deep Learning", "Data Science", "NLP", "Computer Vision",
    "TensorFlow", "PyTorch", "scikit-learn", "Keras", "Pandas", "NumPy", "Matplotlib",
    "Seaborn", "Tableau", "Power BI", "Statistical Analysis", "Data Visualization",
    "CNNs", "RNN", "Transformers", "LLMs",
    "Cybersecurity", "Network Security", "Cryptography", "Penetration Testing",
    "Vulnerability Assessment", "Ethical Hacking", "SIEM", "Firewalls", "OWASP",
    "Threat Modeling", "Incident Response", "Security Monitoring",
    "Android", "Flutter", "Dart", "React Native", "Mobile App Development",
    "SEO", "Google Analytics", "Google Ads", "Facebook Ads", "Email Marketing",
    "Content Creation", "Content Marketing", "Social Media", "Analytics",
    "Campaign Management", "Instagram Marketing", "LinkedIn Marketing", "Brand Strategy",
    "UI/UX", "Figma", "Wireframing", "Prototyping", "Responsive Design",
    "Project Management", "Agile", "Scrum", "Problem Solving", "Communication",
    "Teamwork", "Leadership", "Testing", "Unit Testing", "Automation Testing"
]

def extract_text_from_pdf(pdf_file_path: str) -> str:
    try:
        reader = PdfReader(pdf_file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception:
        return ""

def simple_resume_parser(text: str) -> dict:
    if not text:
        return {"extracted_skills": [], "email": "N/A", "summary": "N/A"}

    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    email = email_match.group(0) if email_match else "N/A"

    found_skills = set()
    text_lower = text.lower()

    for skill in MOCK_SKILLS:
        skill_lower = skill.lower()
        if " " in skill_lower:
            if skill_lower in text_lower:
                found_skills.add(skill)
        else:
            if re.search(r'\b' + re.escape(skill_lower) + r'\b', text_lower):
                found_skills.add(skill)

    summary = "Cannot parse summary reliably yet."
    if nlp:
        doc = nlp(text)
        for sent in doc.sents:
            if "profile" in sent.text.lower() or "summary" in sent.text.lower() or "objective" in sent.text.lower():
                summary = sent.text.strip()
                break

    return {
        "email": email,
        "extracted_skills": list(found_skills),
        "summary": summary
    }

if __name__ == '__main__':
    print(f"Is spaCy NLP loaded? {'Yes' if nlp else 'No'}")
