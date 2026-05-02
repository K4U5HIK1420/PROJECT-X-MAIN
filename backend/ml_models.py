import os
import pandas as pd
import numpy as np
import requests
try:
    import google.generativeai as genai
except ImportError:
    genai = None
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.multiclass import OneVsRestClassifier

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

GEMINI_MODEL = "gemini-2.5-flash"

# ==========================================
# 🔑 PASTE YOUR API KEY HERE
# ==========================================
MY_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
# ==========================================
# Configure Gemini
if not MY_API_KEY:
    print("Warning: Gemini API key not configured. Mentor chat will use fallback responses.")
else:
    if genai is None:
        print("Warning: google-generativeai is not installed. Mentor chat will use fallback responses.")
    else:
        genai.configure(api_key=MY_API_KEY)

MOCK_DATA = {
    'profile_text': [
        "Strong in Python, TensorFlow, and Deep Learning. Experienced with CNNs and Keras.",
        "Expert in Java, SQL, and database design. Experience with REST APIs and unit testing.",
        "Familiar with Python, data cleaning, and statistical analysis. Used Pandas and Matplotlib.",
        "Worked with Linux, network security, and penetration testing. Knows cryptography and firewalls.",
        "Used React and JavaScript for front-end development. Good UI/UX sense.",
        "Bachelors in CS. Focus on network protocol analysis and threat modeling.",
        "Experienced in backend development using Django and PostgreSQL.",
        "Built full stack applications using React, Node.js, Express, MongoDB, HTML, and CSS.",
        "Worked on cloud deployments using AWS, Docker, Kubernetes, and CI/CD pipelines.",
        "Skilled in Tableau, SQL, Excel, Pandas, and Power BI for dashboarding and business analytics.",
        "Developed Android and Flutter apps with Firebase, REST APIs, and Git version control.",
        "Hands-on with Selenium, Java, Jenkins, SQL, and automation testing frameworks.",
        "Worked on Solidity, Ethereum, smart contracts, and Web3.js based decentralized apps.",
        "Strong in SEO, campaign management, Google Analytics, social media strategy, and digital branding.",
        "Built APIs with Flask and FastAPI, integrated PostgreSQL and Redis, and deployed containerized services.",
        "Worked with PyTorch, NLP, transformers, and large language model fine-tuning projects."
    ],
    'domain': [
        ['AI/ML', 'Software Development'],
        ['Software Development'],
        ['Data Science'],
        ['Cybersecurity'],
        ['Software Development', 'Frontend Development'],
        ['Cybersecurity'],
        ['Software Development'],
        ['Full Stack Developer', 'Software Development'],
        ['DevOps Engineer', 'Cloud Architect'],
        ['Data Analyst', 'Data Science'],
        ['Mobile App Developer'],
        ['QA Automation Engineer'],
        ['Blockchain Developer'],
        ['Digital Marketing'],
        ['Backend Developer', 'Software Development'],
        ['AI/ML', 'Data Science']
    ]
}

def rule_based_domain(text: str) -> str:
    t = text.lower()
    marketing_keywords = [
        "seo", "search engine", "google analytics", "google ads", "facebook ads",
        "social media", "content marketing", "email marketing", "mailchimp",
        "instagram", "linkedin", "campaign", "adwords", "ad campaigns", "marketing"
    ]
    if any(k in t for k in marketing_keywords):
        return "Digital Marketing"

    full_stack_keywords = ["node.js", "express", "mongodb", "mern", "full stack", "next.js"]
    if any(k in t for k in full_stack_keywords):
        return "Full Stack Developer"

    backend_keywords = ["django", "flask", "fastapi", "spring boot", "postgresql", "backend"]
    if any(k in t for k in backend_keywords):
        return "Backend Developer"

    frontend_keywords = ["react", "javascript", "html", "css", "tailwind", "material ui", "ui/ux", "frontend"]
    if any(k in t for k in frontend_keywords):
        return "Frontend Development"

    ml_keywords = ["machine learning", "tensorflow", "scikit-learn", "deep learning", "cnn", "neural network", "keras"]
    if any(k in t for k in ml_keywords):
        return "AI/ML"

    data_keywords = ["pandas", "dataframe", "statistical", "visualization", "tableau"]
    if any(k in t for k in data_keywords):
        return "Data Science"

    cybersecurity_keywords = ["cybersecurity", "penetration testing", "cryptography", "network security", "ethical hacking"]
    if any(k in t for k in cybersecurity_keywords):
        return "Cybersecurity"

    devops_keywords = ["docker", "kubernetes", "terraform", "jenkins", "ci/cd", "devops"]
    if any(k in t for k in devops_keywords):
        return "DevOps Engineer"

    mobile_keywords = ["flutter", "dart", "android", "react native", "mobile app"]
    if any(k in t for k in mobile_keywords):
        return "Mobile App Developer"

    return None

class CareerClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.classifier = OneVsRestClassifier(LogisticRegression(solver='liblinear', random_state=42))
        self.mlb = MultiLabelBinarizer()
        self.is_trained = False

    def train_model(self):
        df = pd.DataFrame(MOCK_DATA)
        X_vec = self.vectorizer.fit_transform(df['profile_text'])
        Y_bin = self.mlb.fit_transform(df['domain'])
        self.classifier.fit(X_vec, Y_bin)
        self.is_trained = True

    def predict_domain(self, text: str) -> list:
        if not self.is_trained:
            self.train_model()

        rule_label = rule_based_domain(text)
        if rule_label:
            return [rule_label]

        text_vec = self.vectorizer.transform([text])
        probabilities = self.classifier.predict_proba(text_vec)[0]

        sorted_indices = np.argsort(probabilities)[::-1]
        best_index = sorted_indices[0]
        best_domain = self.mlb.classes_[best_index]

        threshold = 0.12
        predicted_domains = [self.mlb.classes_[i] for i in sorted_indices if probabilities[i] >= threshold]
        if best_domain not in predicted_domains:
            predicted_domains.insert(0, best_domain)

        return predicted_domains

MOCK_JOB_REQUIREMENTS = {
    "AI/ML": ["Python", "TensorFlow", "PyTorch", "Deep Learning", "Machine Learning", "SQL", "Cloud Computing", "NLP"],
    "Software Development": ["Python", "Java", "Git", "REST APIs", "SQL", "Testing", "Problem Solving"],
    "Digital Marketing": ["SEO", "Google Analytics", "Google Ads", "Facebook Ads", "Email Marketing", "Content Creation", "Social Media", "Analytics", "Campaign Management"],
    "AI/ML Engineer": ["Python", "TensorFlow", "PyTorch", "Deep Learning", "Machine Learning", "SQL", "Cloud Computing", "MLOps"],
    "Data Science": ["Python", "R", "Pandas", "NumPy", "Statistical Analysis", "SQL", "Data Visualization", "Machine Learning"],
    "Frontend Development": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Responsive Design", "REST APIs", "UI/UX"],
    "Cybersecurity": ["Linux", "Network Security", "Cryptography", "Penetration Testing", "Vulnerability Assessment", "Threat Modeling", "Incident Response"],
    "Backend Developer": ["Python", "Django", "Flask", "FastAPI", "PostgreSQL", "Docker", "REST APIs", "Redis"],
    "Full Stack Developer": ["JavaScript", "React", "Node.js", "Express", "MongoDB", "HTML", "CSS", "REST APIs", "Git"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "AWS", "Jenkins", "CI/CD", "Terraform", "Monitoring"],
    "Mobile App Developer": ["Dart", "Flutter", "Firebase", "REST APIs", "Git", "Mobile App Development"],
    "Data Analyst": ["SQL", "Excel", "Tableau", "Power BI", "Python", "Data Visualization", "Statistics"],
    "Cloud Architect": ["AWS", "Azure", "Google Cloud", "Networking", "Security", "Terraform", "Docker", "Kubernetes"],
    "QA Automation Engineer": ["Java", "Python", "Selenium", "Jenkins", "Git", "SQL", "Automation Testing"],
    "Blockchain Developer": ["Solidity", "Ethereum", "Smart Contracts", "Web3.js", "JavaScript", "Cryptography"]
}

def analyze_skill_gap(required_skills: list, student_skills: list) -> dict:
    required_set = set(s.lower() for s in required_skills)
    student_set = set(s.lower() for s in student_skills)

    missing_skills = list(required_set - student_set)
    matched_skills = list(required_set.intersection(student_set))

    total_required = len(required_set)
    if total_required == 0:
        completeness_percentage = 100
    else:
        completeness_percentage = (len(matched_skills) / total_required) * 100

    return {
        "missing_skills": missing_skills,
        "matched_skills": matched_skills,
        "completeness_percentage": round(completeness_percentage, 1)
    }

# --- NEW REAL AI MENTOR FUNCTION ---
# --- UPDATED MENTOR FUNCTION ---
def virtual_mentor_response(query, domain, employability_score, missing_skills):
    """
    Sends the user's query and profile context to Google Gemini.
    """
    
    # Check if package and key are valid
    focus_skills = ', '.join(missing_skills[:3]) if missing_skills else 'core domain skills'
    query_lower = (query or "").lower()

    if genai is None:
        if "score" in query_lower or "employability" in query_lower:
            return (
                f"To improve your employability score for {domain}, strengthen {focus_skills}, "
                "complete one polished project, and practice mock interviews consistently."
            )
        if "project" in query_lower:
            return (
                f"For {domain}, build one strong end-to-end project and one smaller focused project around {focus_skills}. "
                "Be ready to explain your architecture, tools, and challenges clearly."
            )
        if "interview" in query_lower:
            return (
                f"For {domain} interviews, revise fundamentals, practice project explanations, and prepare examples that show problem solving. "
                f"Also improve {focus_skills} so your answers sound more job-ready."
            )
        return (
            f"I can still guide you in fallback mode. For {domain}, focus on {focus_skills}, "
            "build at least one solid project, and practice explaining your work clearly in interviews."
        )

    if not MY_API_KEY:
        return "I am offline. Please set GEMINI_API_KEY in the backend environment."

    context_prompt = f"""
    You are an expert Career Mentor for university students.
    You are talking to a student interested in: {domain}.
    
    Student Profile Context:
    - Current Employability Score: {employability_score}/100
    - Identified Skill Gaps: {', '.join(missing_skills) if missing_skills else 'None identified'}
    
    The student asks: "{query}"
    
    Provide a helpful, encouraging, and specific answer (max 3-4 sentences). 
    """

    try:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={MY_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": context_prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.8,
                "topP": 0.95,
                "maxOutputTokens": 320,
                "thinkingConfig": {
                    "thinkingBudget": 0
                }
            }
        }
        api_response = requests.post(endpoint, json=payload, timeout=30)
        if not api_response.ok:
            error_payload = {}
            try:
                error_payload = api_response.json()
            except ValueError:
                pass

            error_message = error_payload.get("error", {}).get("message", api_response.text.strip())
            normalized_error = error_message.lower()

            if api_response.status_code == 403 and "service_disabled" in str(error_payload).lower():
                return (
                    "Gemini API is configured but disabled for this Google project. "
                    "Enable the Gemini API in Google Cloud Console, wait a few minutes, and try again."
                )

            if api_response.status_code in (401, 403) and (
                "api key" in normalized_error or "permission" in normalized_error or "access" in normalized_error
            ):
                return (
                    "Gemini API access is being denied for the current key. "
                    "Please verify the key, billing/project access, and Gemini API enablement."
                )

            raise ValueError(error_message or f"Gemini request failed with status {api_response.status_code}")

        data = api_response.json()
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            text = "".join(part.get("text", "") for part in parts).strip()
            if text:
                return text
        raise ValueError(f"Unexpected Gemini response format: {data}")
    except Exception as e:
        print(f"Gemini API Error: {e}")
        try:
            if genai is not None:
                model = genai.GenerativeModel(GEMINI_MODEL)
                response = model.generate_content(
                    context_prompt,
                    generation_config={
                        "temperature": 0.8,
                        "top_p": 0.95,
                        "max_output_tokens": 320,
                    },
                )
                if getattr(response, "text", "").strip():
                    return response.text.strip()
        except Exception as nested_error:
            print(f"Gemini SDK Fallback Error: {nested_error}")

        if "score" in query_lower or "employability" in query_lower:
            return (
                f"To improve your employability for {domain}, strengthen {focus_skills}, "
                "improve project depth, and practice clearer interview communication."
            )
        if "role" in query_lower or "what happens" in query_lower:
            return (
                f"In {domain} roles, you are expected to solve practical problems, build reliable solutions, and explain your work clearly. "
                f"To prepare well, improve {focus_skills} and connect them to real project outcomes."
            )
        if "project" in query_lower:
            return (
                f"For {domain}, build projects that clearly demonstrate {focus_skills} and include measurable results. "
                "A polished README and clear demo flow will help a lot."
            )
        return (
            f"To improve for {domain}, strengthen {focus_skills}, build 2 polished projects, "
            "practice explaining your work clearly, and revise your weak areas before placements."
        )

def generate_career_roadmap(domain: str, employability_score: float, missing_skills: list):
    
    # Determine level
    if employability_score >= 85:
        level = "Job-Ready"
    elif employability_score >= 65:
        level = "Intermediate"
    else:
        level = "Beginner"

    roadmap = []

    # Phase 1: Foundations
    roadmap.append({
        "phase": "Phase 1: Strengthen Fundamentals",
        "focus": missing_skills[:3] if missing_skills else ["Core concepts review"],
        "goal": "Build strong conceptual clarity"
    })

    # Phase 2: Projects
    roadmap.append({
        "phase": "Phase 2: Project Building",
        "focus": [
            f"Build 2 real-world projects in {domain}",
            "Use GitHub with clean README",
            "Apply best practices"
        ],
        "goal": "Demonstrate practical ability"
    })

    # Phase 3: Interview Prep
    roadmap.append({
        "phase": "Phase 3: Interview Preparation",
        "focus": [
            "Explain projects end-to-end",
            "Practice technical + HR questions",
            "Mock interviews"
        ],
        "goal": "Improve confidence and communication"
    })

    # Phase 4: Job Readiness
    roadmap.append({
        "phase": "Phase 4: Job Readiness",
        "focus": [
            "Optimize resume for ATS",
            "Apply consistently",
            "Network on LinkedIn"
        ],
        "goal": "Convert skills into opportunities"
    })

    return {
        "domain": domain,
        "current_level": level,
        "roadmap": roadmap
    }


def get_ai_readiness() -> dict:
    return {
        "gemini_configured": bool(MY_API_KEY),
        "gemini_library_available": genai is not None
    }
