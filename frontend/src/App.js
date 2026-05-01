import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  Briefcase,
  CheckCircle,
  GitBranch,
  Layout,
  Loader,
  MessageCircle,
  ShieldCheck,
  User,
  Video,
  Zap,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:5000/api/v1";

const INTERVIEW_QUESTIONS = [
  "Tell me about yourself and the role you are targeting.",
  "Describe a technical challenge you solved in one of your projects.",
  "Why should we hire you, and what will you improve in the next 6 months?",
];

const NavButton = ({ view, icon: Icon, label, currentView, setCurrentView }) => (
  <button
    onClick={() => setCurrentView(view)}
    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors w-full mb-2 ${
      currentView === view ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    <Icon size={24} />
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);

const Card = ({ title, children, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full">
    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
      {Icon && <Icon className="mr-2 text-blue-500" size={24} />}
      {title}
    </h2>
    {children}
  </div>
);

const ProgressBar = ({ percentage, label, colorClass = "bg-blue-500" }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
      <span>{label}</span>
      <span>{percentage}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

const StatusPill = ({ ok, label }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      ok ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
    }`}
  >
    {label}
  </span>
);

const TranscriptHighlighter = ({ analysis }) => {
  if (!analysis?.text) return null;

  const { text, issues } = analysis;
  let lastIndex = 0;
  const elements = [];

  issues.forEach((issue, index) => {
    if (issue.start > lastIndex) {
      elements.push(<span key={`text-${index}`}>{text.substring(lastIndex, issue.start)}</span>);
    }

    elements.push(
      <span
        key={`issue-${index}`}
        className={`px-1 mx-0.5 rounded text-xs font-bold text-white ${
          issue.type === "filler" ? "bg-yellow-500" : "bg-red-500"
        }`}
        title={`${issue.feedback} (${issue.type})`}
      >
        {text.substring(issue.start, issue.end)}
      </span>
    );

    lastIndex = issue.end;
  });

  if (lastIndex < text.length) {
    elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
        <MessageCircle size={16} className="mr-2" />
        Auto Transcript Review
      </h4>
      <p className="text-gray-800 leading-relaxed text-sm">{elements}</p>
      <div className="mt-2 flex gap-3 text-xs text-gray-500">
        <span className="flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
          Filler Word
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-1" />
          Repetition
        </span>
      </div>
    </div>
  );
};

const ReadinessPanel = ({ readiness }) => {
  const interviewStatus = readiness?.interview_analysis || {};
  const mentorStatus = readiness?.mentor_chat || {};

  return (
    <Card title="System Readiness" icon={ShieldCheck}>
      <div className="flex flex-wrap gap-2 mb-4">
        <StatusPill ok={readiness?.backend_status === "online"} label="Backend Online" />
        <StatusPill ok={interviewStatus.whisper_loaded} label="Whisper Ready" />
        <StatusPill ok={interviewStatus.deepface_available} label="DeepFace Ready" />
        <StatusPill ok={interviewStatus.opencv_available} label="OpenCV Ready" />
        <StatusPill ok={mentorStatus.gemini_configured && mentorStatus.gemini_library_available} label="Gemini Ready" />
      </div>
      <p className="text-sm text-gray-600">
        This panel shows whether the real AI services needed for the presentation are available before you start the demo.
      </p>
    </Card>
  );
};

const ProfileView = ({
  resumeText,
  setResumeText,
  analysisResult,
  profileMatchPercentage,
  recommendedDomain,
  isLoading,
  handleAnalyzeProfile,
  readiness,
}) => (
  <div className="grid xl:grid-cols-3 gap-8">
    <div className="xl:col-span-2 space-y-8">
      <Card title="Student Profile Input" icon={Briefcase}>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={11}
          placeholder="Paste your resume, project summary, and skills here..."
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleAnalyzeProfile}
          disabled={isLoading}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center transition-colors"
        >
          {isLoading ? <Loader className="animate-spin mr-2" size={18} /> : <Zap size={18} className="mr-2" />}
          {isLoading ? "Analyzing..." : "Analyze Profile & Skills"}
        </button>
      </Card>

      <Card title="Career & Skill Gap Analysis" icon={GitBranch}>
        {analysisResult ? (
          <>
            <p className="text-lg font-bold text-green-600 mb-2">Recommended Domain: {recommendedDomain}</p>
            <ProgressBar
              percentage={profileMatchPercentage}
              label={`Profile Match Score (${recommendedDomain})`}
              colorClass={
                profileMatchPercentage > 75
                  ? "bg-green-500"
                  : profileMatchPercentage > 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }
            />
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold mb-2">Extracted Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(analysisResult.student_data?.extracted_skills || []).map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.skill_gap_analysis?.missing_skills?.length ? (
                    analysisResult.skill_gap_analysis.missing_skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No major gaps found.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Analyze a profile to see extracted skills, recommended domain, and skill gaps.</p>
        )}
      </Card>
    </div>

    <div className="space-y-8">
      <ReadinessPanel readiness={readiness} />
      <Card title="Career Roadmap" icon={Activity}>
        {analysisResult?.career_roadmap ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Current level: <strong>{analysisResult.career_roadmap.current_level}</strong>
            </p>
            {analysisResult.career_roadmap.roadmap.map((phase) => (
              <div key={phase.phase} className="border rounded-lg p-3 bg-gray-50">
                <p className="font-semibold text-gray-800">{phase.phase}</p>
                <p className="text-sm text-gray-600 mt-1">{phase.goal}</p>
                <p className="text-sm text-blue-700 mt-2">{phase.focus.join(", ")}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Analyze the profile first to generate a career roadmap.</p>
        )}
      </Card>
    </div>
  </div>
);

const InterviewView = ({ interviewResult, setInterviewResult, profileMatchPercentage }) => {
  const [phase, setPhase] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [evaluationJob, setEvaluationJob] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    if (phase === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "live") return undefined;
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "live" || !streamRef.current) return undefined;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(streamRef.current);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    let rafId;

    const detectSpeech = () => {
      analyser.getByteFrequencyData(data);
      const volume = data.reduce((a, b) => a + b, 0) / data.length;
      setIsSpeaking(volume > 20);
      rafId = requestAnimationFrame(detectSpeech);
    };

    detectSpeech();
    return () => {
      cancelAnimationFrame(rafId);
      audioContext.close();
    };
  }, [phase]);

  useEffect(() => {
    if (!evaluationJob?.job_id || evaluationJob.status === "completed" || evaluationJob.status === "failed") {
      return undefined;
    }

    const interval = setInterval(async () => {
      const response = await fetch(`${API_BASE_URL}/interview_sessions/${evaluationJob.job_id}`);
      const data = await response.json();
      setEvaluationJob(data);

      if (data.status === "completed") {
        setInterviewResult(data.result);
        setPhase("result");
      }

      if (data.status === "failed") {
        setPhase("ended");
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [evaluationJob, setInterviewResult]);

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      recordedChunksRef.current = [];
      setEvaluationJob(null);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) recordedChunksRef.current.push(event.data);
      };
      recorder.start();
      setPhase("live");
    } catch (error) {
      alert("Could not access camera or microphone.");
      console.error(error);
    }
  };

  const endInterview = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
      setPhase("ended");
      setSeconds(0);
    };

    mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const evaluatePerformance = async () => {
    if (!recordedChunksRef.current.length) {
      alert("No recording found.");
      return;
    }

    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
    const formData = new FormData();
    formData.append("video", blob, "interview.webm");
    formData.append("profile_match_percentage", String(profileMatchPercentage || 0));

    const response = await fetch(`${API_BASE_URL}/interview_sessions`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setEvaluationJob(data);
    setPhase("processing");
  };

  const downloadReport = async () => {
    if (!interviewResult) return;

    const response = await fetch(`${API_BASE_URL}/interview_report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interviewResult),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "AI_Interview_Report.pdf";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid xl:grid-cols-2 gap-8">
      <Card title="Live AI Interview" icon={Video}>
        {phase === "idle" && (
          <>
            <button onClick={startInterview} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Start Interview Recording
            </button>
            <p className="text-sm text-gray-500 mt-4">
              This records live audio and video, sends the real recording to the backend, then runs transcription,
              communication scoring, and facial analysis.
            </p>
          </>
        )}

        {phase === "live" && (
          <>
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-72 rounded-lg border mb-4 bg-black object-cover" />
              {isSpeaking && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  Speaking
                </div>
              )}
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {new Date(seconds * 1000).toISOString().substr(14, 5)}
              </div>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4 mb-4">
              <p className="font-semibold mb-2">Suggested Questions</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {INTERVIEW_QUESTIONS.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
            <button onClick={endInterview} className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
              End Interview
            </button>
          </>
        )}

        {phase === "ended" && (
          <>
            <video src={videoURL} controls className="w-full rounded-lg border mb-4" />
            <button onClick={evaluatePerformance} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Evaluate Performance
            </button>
            <p className="text-xs text-gray-500 mt-3">Current profile match score used in the demo flow: {profileMatchPercentage}%</p>
          </>
        )}

        {phase === "processing" && (
          <div className="space-y-4">
            <div className="flex items-center text-blue-700">
              <Loader className="animate-spin mr-2" size={18} />
              <span className="font-semibold">Interview analysis in progress</span>
            </div>
            <ProgressBar percentage={evaluationJob?.progress || 0} label={evaluationJob?.stage || "Preparing analysis"} />
            <p className="text-sm text-gray-600">
              Real-time backend stage: <strong>{evaluationJob?.stage || "Waiting"}</strong>
            </p>
          </div>
        )}
      </Card>

      <Card title="Interview Feedback" icon={Zap}>
        {interviewResult ? (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-sm text-gray-600">Employability Score</p>
                <p className="text-3xl font-bold text-blue-700">{interviewResult.employability_score}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-sm text-gray-600">Interview Score</p>
                <p className="text-3xl font-bold text-green-700">{interviewResult.interview_score}</p>
              </div>
            </div>
            <p className="mt-4 text-gray-700">
              <strong>Sentiment:</strong> {interviewResult.communication_analysis?.sentiment}
            </p>
            <p className="text-gray-700">
              <strong>Dominant Emotion:</strong> {interviewResult.facial_analysis?.emotions?.dominant_emotion}
            </p>
            <p className="mt-2 text-gray-700">{interviewResult.facial_analysis?.feedback}</p>
            <p className="mt-2 text-gray-700">{interviewResult.communication_analysis?.clarity_feedback}</p>
            <TranscriptHighlighter analysis={interviewResult.communication_analysis?.transcript_analysis} />
            <button onClick={downloadReport} className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
              Download Interview Report
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Zap className="mb-2 opacity-20" size={48} />
            <p>Complete an interview to see real AI feedback.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

const MentorView = ({
  chatHistory,
  chatQuery,
  setChatQuery,
  handleChatQuery,
  isLoading,
  recommendedDomain,
  analysisResult,
}) => (
  <div className="grid xl:grid-cols-2 gap-8">
    <Card title="Virtual Career Mentor" icon={MessageCircle}>
      <div className="h-96 overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col space-y-3">
        {chatHistory.map((msg, index) => (
          <div key={`${msg.type}-${index}`} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md text-sm ${
                msg.type === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-tl-none border border-gray-300 shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 bg-white text-gray-500 rounded-xl rounded-tl-none border border-gray-300 text-sm">
              <Loader className="animate-spin inline mr-2" size={14} />
              Mentor is typing...
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={chatQuery}
          onChange={(e) => setChatQuery(e.target.value)}
          placeholder={recommendedDomain === "Unknown" ? "Analyze your profile first to chat..." : `Ask about ${recommendedDomain}, skills, jobs, or interviews`}
          className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
          disabled={isLoading || recommendedDomain === "Unknown"}
          onKeyDown={(e) => e.key === "Enter" && handleChatQuery()}
        />
        <button
          onClick={handleChatQuery}
          className={`px-4 rounded-r-lg text-white font-semibold transition-colors ${
            isLoading || recommendedDomain === "Unknown" ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
          }`}
          disabled={isLoading || recommendedDomain === "Unknown"}
        >
          Send
        </button>
      </div>
    </Card>

    <Card title="Mentor Context" icon={Activity}>
      {analysisResult ? (
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            <strong>Target Domain:</strong> {recommendedDomain}
          </p>
          <p>
            <strong>Profile Match:</strong> {analysisResult.profile_match_percentage}%
          </p>
          <p>
            <strong>Top Missing Skills:</strong>{" "}
            {(analysisResult.skill_gap_analysis?.missing_skills || []).slice(0, 5).join(", ") || "No major gaps"}
          </p>
          <p>
            Use this panel during the presentation to show that mentor responses are grounded in the student’s actual
            profile analysis.
          </p>
        </div>
      ) : (
        <p className="text-gray-500">Analyze a profile first so the mentor can respond with real student context.</p>
      )}
    </Card>
  </div>
);

const DashboardView = ({ analytics, readiness }) => (
  <div className="grid xl:grid-cols-2 gap-8">
    <Card title="Live Session Analytics" icon={Activity}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-sm text-gray-600">Profiles Analyzed</p>
          <p className="text-2xl font-bold text-blue-700">{analytics?.profiles_analyzed ?? 0}</p>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <p className="text-sm text-gray-600">Interviews Completed</p>
          <p className="text-2xl font-bold text-green-700">{analytics?.interviews_completed ?? 0}</p>
        </div>
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-sm text-gray-600">Average Profile Match</p>
          <p className="text-2xl font-bold text-amber-700">{analytics?.average_profile_match ?? 0}%</p>
        </div>
        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
          <p className="text-sm text-gray-600">Average Employability</p>
          <p className="text-2xl font-bold text-indigo-700">{analytics?.average_employability_score ?? 0}</p>
        </div>
      </div>
      <div className="mt-6 space-y-2 text-sm text-gray-700">
        <p>
          <strong>Top Recommended Domain:</strong> {analytics?.top_recommended_domain || "No data yet"}
        </p>
        <p>
          <strong>Most Common Skill Gap:</strong> {analytics?.top_skill_gap?.skill || "No data yet"}
        </p>
        <p>
          <strong>Mentor Messages:</strong> {analytics?.mentor_messages ?? 0}
        </p>
      </div>
    </Card>

    <ReadinessPanel readiness={readiness} />
  </div>
);

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [interviewResult, setInterviewResult] = useState(null);
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("profile");
  const [readiness, setReadiness] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const profileMatchPercentage = analysisResult?.profile_match_percentage || 0;
  const recommendedDomain = analysisResult?.career_recommendations?.[0] || "Unknown";

  const loadDashboardData = async () => {
    try {
      const [readinessRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/readiness`),
        fetch(`${API_BASE_URL}/session_analytics`),
      ]);
      const readinessData = await readinessRes.json();
      const analyticsData = await analyticsRes.json();
      setReadiness(readinessData);
      setAnalytics(analyticsData);
    } catch (loadError) {
      console.error(loadError);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAnalyzeProfile = async () => {
    if (!resumeText.trim()) {
      setError("Please paste a resume or skill summary to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze_profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
      });
      if (!response.ok) throw new Error("Backend analysis failed.");

      const data = await response.json();
      setAnalysisResult(data);
      setInterviewResult(null);
      setChatHistory([
        {
          type: "mentor",
          text: `Your profile maps best to ${data.career_recommendations?.[0] || "Unknown"}. Ask me about skills, roadmap, or interview preparation.`,
        },
      ]);
      loadDashboardData();
    } catch (analysisError) {
      setError(`Failed to analyze profile. ${analysisError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatQuery = async () => {
    if (!chatQuery.trim()) return;
    if (recommendedDomain === "Unknown") {
      setError("Please analyze the profile first.");
      return;
    }

    const userMessage = chatQuery;
    setChatHistory((prev) => [...prev, { type: "user", text: userMessage }]);
    setChatQuery("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/mentor_chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage,
          domain: recommendedDomain,
          employability_score: interviewResult?.employability_score || profileMatchPercentage,
          missing_skills: analysisResult?.skill_gap_analysis?.missing_skills || [],
        }),
      });
      if (!response.ok) throw new Error("Mentor request failed.");

      const data = await response.json();
      setChatHistory((prev) => [...prev, { type: "mentor", text: data.mentor_response }]);
      loadDashboardData();
    } catch (chatError) {
      setChatHistory((prev) => [...prev, { type: "mentor", text: "The mentor service is unavailable right now." }]);
      console.error(chatError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-6 fixed h-full left-0 top-0 z-10">
        <div className="mb-8 bg-blue-100 p-2 rounded-xl">
          <Layout className="text-blue-600" size={28} />
        </div>
        <NavButton view="profile" icon={User} label="Profile" currentView={currentView} setCurrentView={setCurrentView} />
        <NavButton view="interview" icon={Video} label="Interview" currentView={currentView} setCurrentView={setCurrentView} />
        <NavButton view="mentor" icon={MessageCircle} label="Mentor" currentView={currentView} setCurrentView={setCurrentView} />
        <NavButton view="dashboard" icon={Activity} label="Dashboard" currentView={currentView} setCurrentView={setCurrentView} />
      </div>

      <div className="ml-24 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {currentView === "profile" && "Career Profile Analysis"}
              {currentView === "interview" && "AI Interview Evaluation"}
              {currentView === "mentor" && "Career Mentor"}
              {currentView === "dashboard" && "Presentation Dashboard"}
            </h1>
            <p className="text-gray-500 mt-2">Real AI-driven insights for student placement readiness</p>
          </header>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="mr-2" size={20} />
              {error}
            </div>
          )}

          {currentView === "profile" && (
            <ProfileView
              resumeText={resumeText}
              setResumeText={setResumeText}
              analysisResult={analysisResult}
              profileMatchPercentage={profileMatchPercentage}
              recommendedDomain={recommendedDomain}
              isLoading={isLoading}
              handleAnalyzeProfile={handleAnalyzeProfile}
              readiness={readiness}
            />
          )}

          {currentView === "interview" && (
            <InterviewView
              interviewResult={interviewResult}
              setInterviewResult={(value) => {
                setInterviewResult(value);
                loadDashboardData();
              }}
              profileMatchPercentage={profileMatchPercentage}
            />
          )}

          {currentView === "mentor" && (
            <MentorView
              chatHistory={chatHistory}
              chatQuery={chatQuery}
              setChatQuery={setChatQuery}
              handleChatQuery={handleChatQuery}
              isLoading={isLoading}
              recommendedDomain={recommendedDomain}
              analysisResult={analysisResult}
            />
          )}

          {currentView === "dashboard" && <DashboardView analytics={analytics} readiness={readiness} />}
        </div>
      </div>
    </div>
  );
}
