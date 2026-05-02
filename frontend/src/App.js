import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle,
  Download,
  Gauge,
  GitBranch,
  Layout,
  Loader,
  MessageCircle,
  Mic,
  Orbit,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Video,
  Zap,
} from "lucide-react";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000"}/api/v1`;

const INTERVIEW_QUESTIONS = [
  "Tell me about yourself and the role you are targeting.",
  "Describe a technical challenge you solved in one of your projects.",
  "Why should we hire you, and what will you improve in the next 6 months?",
];

const NAV_ITEMS = [
  { view: "profile", label: "Profile", subtitle: "Skills map", icon: User },
  { view: "interview", label: "Interview", subtitle: "Live analysis", icon: Video },
  { view: "mentor", label: "Mentor", subtitle: "Gemini coach", icon: MessageCircle },
  { view: "dashboard", label: "Dashboard", subtitle: "Session view", icon: Activity },
];

const VIEW_CONTENT = {
  profile: {
    eyebrow: "Placement Readiness Engine",
    title: "Career Profile Intelligence",
    description: "Map skills, spot gaps, and generate a sharper path to the right domain before the interview even starts.",
  },
  interview: {
    eyebrow: "Real-Time Evaluation",
    title: "AI Interview Command Center",
    description: "Record a live response, run transcript and emotion analysis, and present a clean scoring flow with real backend progress.",
  },
  mentor: {
    eyebrow: "Guided Improvement",
    title: "Virtual Career Mentor",
    description: "Use Gemini-backed coaching grounded in the actual profile analysis so every answer stays relevant to the student.",
  },
  dashboard: {
    eyebrow: "Presentation Snapshot",
    title: "Live Session Dashboard",
    description: "Show total activity, readiness signals, and current usage metrics in one high-clarity presentation screen.",
  },
};

const getScoreTone = (value) => {
  if (value >= 80) return "emerald";
  if (value >= 60) return "amber";
  return "rose";
};

const toneClasses = {
  slate: "border-white/10 bg-white/5 text-slate-100",
  blue: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  emerald: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  amber: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  rose: "border-rose-300/20 bg-rose-400/10 text-rose-100",
  violet: "border-violet-300/20 bg-violet-400/10 text-violet-100",
};

const AppShell = ({ children }) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.16),_transparent_26%),radial-gradient(circle_at_right,_rgba(56,189,248,0.14),_transparent_22%),linear-gradient(160deg,#07111f_0%,#0a1627_48%,#0e1b31_100%)] text-slate-100">
    <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-50">
      <div className="absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 right-[-5%] h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl animate-float-delayed" />
      <div className="absolute left-[38%] top-[18%] h-32 w-32 rounded-full bg-sky-300/10 blur-3xl animate-pulse-soft" />
      <div className="absolute inset-0 animate-grid-drift bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(6,182,212,0.05),transparent)] animate-scanline" />
    </div>
    <div className="relative">{children}</div>
  </div>
);

const NavButton = ({ item, currentView, setCurrentView }) => {
  const { view, label, subtitle, icon: Icon } = item;
  const active = currentView === view;

  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`group w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-300 ${
        active
          ? "border-cyan-300/40 bg-white/14 shadow-[0_20px_60px_rgba(14,165,233,0.16)]"
          : "border-white/8 bg-white/4 hover:border-white/16 hover:bg-white/8"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border md:h-11 md:w-11 ${
            active ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100" : "border-white/10 bg-white/6 text-slate-300"
          }`}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className={`font-display text-sm ${active ? "text-white" : "text-slate-100"}`}>{label}</p>
          <p className="hidden text-xs text-slate-400 md:block">{subtitle}</p>
        </div>
      </div>
    </button>
  );
};

const GlassCard = ({ title, subtitle, children, icon: Icon, action }) => (
  <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/7 p-4 shadow-[0_24px_80px_rgba(3,7,18,0.35)] backdrop-blur-xl transition duration-500 hover:border-cyan-300/20 hover:bg-white/[0.085] hover:shadow-[0_32px_100px_rgba(6,182,212,0.12)] md:rounded-[28px] md:p-6">
    <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),transparent_38%)]" />
    <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.8),transparent)] opacity-60" />
    <div className="relative">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4 md:mb-5">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 md:h-12 md:w-12">
                <Icon size={21} />
              </div>
            )}
            <div>
              {title && <h2 className="font-display text-lg text-white md:text-xl">{title}</h2>}
              {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  </div>
);

const MetricTile = ({ label, value, hint, tone = "blue", icon: Icon }) => (
  <div className={`relative overflow-hidden rounded-[20px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:rounded-[24px] ${toneClasses[tone]}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_38%)]" />
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-300/70">{label}</p>
        <p className="mt-3 font-display text-2xl text-white md:text-3xl">{value}</p>
        {hint && <p className="mt-2 text-sm text-slate-300/85">{hint}</p>}
      </div>
      {Icon && <Icon className="mt-1 text-white/70" size={20} />}
    </div>
  </div>
);

const SignalRail = ({ readiness, recommendedDomain, profileMatchPercentage, analytics }) => {
  const readinessCount = [
    readiness?.backend_status === "online",
    readiness?.interview_analysis?.whisper_loaded,
    readiness?.interview_analysis?.deepface_available,
    readiness?.interview_analysis?.opencv_available,
    readiness?.mentor_chat?.gemini_configured && readiness?.mentor_chat?.gemini_library_available,
  ].filter(Boolean).length;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MetricTile label="Live Systems" value={`${readinessCount}/5`} hint="Backend stack online" tone="blue" icon={Radar} />
      <MetricTile label="Target Role" value={recommendedDomain === "Unknown" ? "Waiting" : recommendedDomain} hint="Role recommendation" tone="violet" icon={Target} />
      <MetricTile
        label="Readiness Score"
        value={recommendedDomain === "Unknown" ? "--" : `${profileMatchPercentage}%`}
        hint="Profile fit before interview"
        tone={recommendedDomain === "Unknown" ? "slate" : getScoreTone(profileMatchPercentage)}
        icon={Gauge}
      />
      <MetricTile label="Live Usage" value={analytics?.mentor_messages ?? 0} hint="Mentor prompts sent" tone="emerald" icon={Bot} />
    </div>
  );
};

const SectionHero = ({ currentView, readiness, recommendedDomain, profileMatchPercentage, analytics }) => {
  const copy = VIEW_CONTENT[currentView];
  const mentorReady = readiness?.mentor_chat?.gemini_configured && readiness?.mentor_chat?.gemini_library_available;

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(8,47,73,0.72)_55%,rgba(5,150,105,0.45))] p-4 shadow-[0_30px_90px_rgba(2,8,23,0.45)] md:rounded-[34px] md:p-8">
      <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute left-1/3 top-1/2 h-28 w-28 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="relative grid gap-6 xl:grid-cols-[1.55fr_0.95fr] xl:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
            <Sparkles size={14} />
            {copy.eyebrow}
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-emerald-100">
            <Orbit size={13} />
            Examiner Demo Mode
          </div>
          <h1 className="max-w-3xl font-display text-3xl leading-tight text-white sm:text-4xl md:text-5xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:mt-4 md:text-base md:leading-7">{copy.description}</p>
          <div className="mt-5 max-w-2xl md:mt-6">
            <SignalRail
              readiness={readiness}
              recommendedDomain={recommendedDomain}
              profileMatchPercentage={profileMatchPercentage}
              analytics={analytics}
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-4 md:rounded-[30px] md:p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_55%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mission Snapshot</p>
            <div className="mt-4 flex items-center justify-center md:mt-6">
              <div className="relative flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
                <div className="absolute inset-0 rounded-full border border-cyan-300/15" />
                <div className="absolute inset-4 rounded-full border border-cyan-300/20 animate-pulse-soft" />
                <div className="absolute inset-8 rounded-full border border-emerald-300/20" />
                <div className="absolute h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.9)] animate-orbit-ring" />
                <div className="absolute h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.9)] animate-orbit-ring-reverse" />
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mentor Status</p>
                  <p className="mt-3 font-display text-3xl text-white md:text-4xl">{mentorReady ? "LIVE" : "SETUP"}</p>
                  <p className="mt-2 text-sm text-slate-300">{mentorReady ? "Gemini connected and ready" : "Check backend readiness"}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
                <span className="text-slate-500">Current role signal:</span> <span className="text-white">{recommendedDomain === "Unknown" ? "Waiting for analysis" : recommendedDomain}</span>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
                <span className="text-slate-500">Presentation state:</span> <span className="text-white">Real APIs, real scoring, examiner-safe UI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ percentage, label }) => {
  const tone = getScoreTone(percentage);
  const barColor = tone === "emerald" ? "from-emerald-400 to-teal-300" : tone === "amber" ? "from-amber-400 to-orange-300" : "from-rose-400 to-red-300";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span className="font-semibold text-white">{percentage}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const StatusPill = ({ ok, label }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
      ok ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100" : "border-amber-300/20 bg-amber-400/10 text-amber-100"
    }`}
  >
    <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-300" : "bg-amber-300"}`} />
    {label}
  </span>
);

const SkillChip = ({ skill, type = "primary" }) => {
  const classes =
    type === "danger"
      ? "border-rose-300/20 bg-rose-400/10 text-rose-100"
      : "border-cyan-300/20 bg-cyan-400/10 text-cyan-100";

  return <span className={`rounded-full border px-3 py-1.5 text-sm ${classes}`}>{skill}</span>;
};

const RoadmapPhaseCard = ({ phase, index }) => (
  <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-400/15 font-display text-cyan-100">{index + 1}</div>
      <div>
        <p className="font-display text-white">{phase.phase}</p>
        <p className="text-sm text-slate-400">{phase.goal}</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {phase.focus.map((item) => (
        <span key={item} className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-sm text-slate-300">
          {item}
        </span>
      ))}
    </div>
  </div>
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
        className={`rounded px-1.5 py-0.5 font-semibold text-slate-950 ${
          issue.type === "filler" ? "bg-amber-300" : "bg-rose-300"
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
    <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Radar size={16} className="text-cyan-200" />
        <h4 className="font-display text-white">Auto Transcript Review</h4>
      </div>
      <p className="text-sm leading-7 text-slate-200">{elements}</p>
      <div className="mt-4 flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          Filler Word
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
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
    <GlassCard title="System Readiness" subtitle="Live backend capability check" icon={ShieldCheck}>
      <div className="flex flex-wrap gap-2">
        <StatusPill ok={readiness?.backend_status === "online"} label="Backend Online" />
        <StatusPill ok={interviewStatus.whisper_loaded} label="Whisper Ready" />
        <StatusPill ok={interviewStatus.deepface_available} label="DeepFace Ready" />
        <StatusPill ok={interviewStatus.opencv_available} label="OpenCV Ready" />
        <StatusPill ok={mentorStatus.gemini_configured && mentorStatus.gemini_library_available} label="Gemini Ready" />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">
        This panel confirms the real services needed for the presentation before you start the live demo.
      </p>
    </GlassCard>
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
  resultsRef,
}) => (
  <div className="grid gap-8 xl:grid-cols-[1.6fr_0.95fr]">
    <div className="space-y-8">
      <GlassCard
        title="Student Intelligence Input"
        subtitle="Paste resume, projects, technologies, and achievements"
        icon={Briefcase}
        action={
          <div className="hidden rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs text-slate-300 md:block">
            Real parsing + role prediction
          </div>
        }
      >
        <div className="grid gap-5">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={12}
            placeholder="Paste your resume, project summary, and skills here..."
            className="w-full rounded-[24px] border border-white/12 bg-slate-950/35 p-5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-300/30 focus:bg-slate-950/55"
            disabled={isLoading}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <MetricTile label="Resume Status" value={resumeText.trim() ? "Loaded" : "Empty"} hint="Input ready for parsing" tone={resumeText.trim() ? "emerald" : "slate"} icon={Layout} />
            <MetricTile label="Recommended Domain" value={recommendedDomain === "Unknown" ? "--" : recommendedDomain} hint="Updated after analysis" tone="violet" icon={Target} />
            <MetricTile label="Profile Match" value={analysisResult ? `${profileMatchPercentage}%` : "--"} hint="Role-fit score" tone={analysisResult ? getScoreTone(profileMatchPercentage) : "slate"} icon={Gauge} />
          </div>

          <button
            onClick={handleAnalyzeProfile}
            disabled={isLoading}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-cyan-300/30 bg-[linear-gradient(90deg,rgba(14,165,233,0.95),rgba(20,184,166,0.95))] px-5 py-4 font-semibold text-slate-950 shadow-[0_24px_60px_rgba(34,211,238,0.18)] transition hover:translate-y-[-1px] hover:shadow-[0_32px_80px_rgba(34,211,238,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader className="animate-spin" size={18} /> : <Zap size={18} />}
            {isLoading ? "Analyzing Student Profile..." : "Analyze Profile & Build Placement View"}
            {!isLoading && <ArrowRight className="transition group-hover:translate-x-1" size={18} />}
          </button>

          {analysisResult && (
            <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              Analysis complete. The project has updated the domain recommendation, extracted skills, missing skills, and roadmap below.
            </div>
          )}
        </div>
      </GlassCard>

      <div ref={resultsRef}>
        <GlassCard title="Career & Skill Gap Analysis" subtitle="Readable output for your examiner" icon={GitBranch}>
          {analysisResult ? (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/75">Primary Recommendation</p>
                  <h3 className="mt-3 font-display text-3xl text-white">{recommendedDomain}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    The system mapped the profile to this domain based on extracted technologies, keywords, and trained classification logic.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                  <ProgressBar percentage={profileMatchPercentage} label={`Role-fit score for ${recommendedDomain}`} />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <h3 className="font-display text-lg text-white">Extracted Skills</h3>
                  <p className="mt-1 text-sm text-slate-400">Skills detected from the profile text.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(analysisResult.student_data?.extracted_skills || []).map((skill) => (
                      <SkillChip key={skill} skill={skill} />
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <h3 className="font-display text-lg text-white">Missing Skills</h3>
                  <p className="mt-1 text-sm text-slate-400">Best areas to improve before placements.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysisResult.skill_gap_analysis?.missing_skills?.length ? (
                      analysisResult.skill_gap_analysis.missing_skills.map((skill) => <SkillChip key={skill} skill={skill} type="danger" />)
                    ) : (
                      <p className="text-sm text-slate-300">No major gaps found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/12 bg-white/4 p-8 text-center text-slate-400">
              Run a profile analysis to unlock the extracted skills, role recommendation, and skill-gap presentation view.
            </div>
          )}
        </GlassCard>
      </div>
    </div>

    <div className="space-y-8">
      <ReadinessPanel readiness={readiness} />
      <GlassCard title="Career Roadmap" subtitle="Stage-by-stage improvement path" icon={Activity}>
        {analysisResult?.career_roadmap ? (
          <div className="space-y-4">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Current Level</p>
              <p className="mt-2 font-display text-2xl text-white">{analysisResult.career_roadmap.current_level}</p>
            </div>
            {analysisResult.career_roadmap.roadmap.map((phase, index) => (
              <RoadmapPhaseCard key={phase.phase} phase={phase} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/12 bg-white/4 p-8 text-center text-slate-400">
            Analyze the profile first to generate a structured roadmap for the target domain.
          </div>
        )}
      </GlassCard>
    </div>
  </div>
);

const InterviewView = ({ interviewResult, setInterviewResult, profileMatchPercentage, hasProfileAnalysis }) => {
  const [phase, setPhase] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [evaluationJob, setEvaluationJob] = useState(null);
  const [transcriptPreview, setTranscriptPreview] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);

  const videoRef = useRef(null);
  const recordedVideoRef = useRef(null);
  const recordedAudioRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const recordedChunksRef = useRef([]);
  const recordedAudioChunksRef = useRef([]);

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
      recordedAudioChunksRef.current = [];
      setEvaluationJob(null);
      setVideoURL(null);
      setAudioURL(null);
      setTranscriptPreview("");
      transcriptRef.current = "";

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) recordedChunksRef.current.push(event.data);
      };

      const audioStream = new MediaStream(stream.getAudioTracks());
      const audioRecorder = new MediaRecorder(audioStream);
      audioRecorderRef.current = audioRecorder;
      audioRecorder.ondataavailable = (event) => {
        if (event.data.size) recordedAudioChunksRef.current.push(event.data);
      };

      recorder.start();
      audioRecorder.start();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (event) => {
          let finalText = "";
          let interimText = "";

          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) {
              finalText += `${result[0].transcript} `;
            } else {
              interimText += result[0].transcript;
            }
          }

          if (finalText) {
            transcriptRef.current = `${transcriptRef.current} ${finalText}`.trim();
          }

          setTranscriptPreview(`${transcriptRef.current} ${interimText}`.trim());
        };
        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
        };
        recognition.start();
        speechRecognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }

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

    if (audioRecorderRef.current) {
      audioRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedAudioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };
    }

    try {
      speechRecognitionRef.current?.stop();
    } catch (error) {
      console.error("Speech recognition stop error:", error);
    }

    mediaRecorderRef.current.stop();
    audioRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const downloadBlob = (chunks, mimeType, filename) => {
    if (!chunks.length) return;
    const blob = new Blob(chunks, { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const evaluatePerformance = async () => {
    if (!recordedChunksRef.current.length) {
      alert("No recording found.");
      return;
    }

    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
    const audioBlob = recordedAudioChunksRef.current.length ? new Blob(recordedAudioChunksRef.current, { type: "audio/webm" }) : null;
    const formData = new FormData();
    formData.append("video", blob, "interview.webm");
    if (audioBlob) {
      formData.append("audio", audioBlob, "interview-audio.webm");
    }
    if (hasProfileAnalysis) {
      formData.append("profile_match_percentage", String(profileMatchPercentage));
    }
    if (transcriptRef.current.trim()) {
      formData.append("transcript_hint", transcriptRef.current.trim());
    }

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
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <GlassCard title="Live AI Interview" subtitle="Record, review, and send to the backend" icon={Video}>
        {phase === "idle" && (
          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.65),rgba(15,23,42,0.8))] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-100">
                  <Mic size={20} />
                </div>
                <div>
                  <p className="font-display text-lg text-white">Interview Capture Ready</p>
                  <p className="text-sm text-slate-400">Uses real audio, video, transcript, and facial analysis.</p>
                </div>
              </div>
              <button
                onClick={startInterview}
                className="inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-cyan-300/30 bg-[linear-gradient(90deg,rgba(6,182,212,0.96),rgba(20,184,166,0.96))] px-5 py-4 font-semibold text-slate-950 transition hover:translate-y-[-1px]"
              >
                <Video size={18} />
                Start Interview Recording
              </button>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="font-display text-white">Suggested Questions</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
                {INTERVIEW_QUESTIONS.map((question) => (
                  <li key={question} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {phase === "live" && (
          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/50">
              <video ref={videoRef} autoPlay playsInline muted className="h-80 w-full object-cover" />
              <div className="absolute left-4 top-4 rounded-full border border-rose-300/30 bg-rose-400/90 px-3 py-1 text-xs font-semibold text-slate-950">
                {new Date(seconds * 1000).toISOString().substr(14, 5)}
              </div>
              {isSpeaking && (
                <div className="absolute right-4 top-4 rounded-full border border-emerald-300/30 bg-emerald-400/90 px-3 py-1 text-xs font-semibold text-slate-950">
                  Speaking
                </div>
              )}
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="font-display text-white">Live Speech Preview</p>
              <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-300">
                {transcriptPreview || (speechSupported ? "Listening for speech..." : "Browser speech recognition is not available here.")}
              </p>
            </div>

            <button
              onClick={endInterview}
              className="inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-rose-300/20 bg-rose-400/90 px-5 py-4 font-semibold text-slate-950 transition hover:opacity-95"
            >
              End Interview
            </button>
          </div>
        )}

        {phase === "ended" && (
          <div className="space-y-5">
            <video ref={recordedVideoRef} src={videoURL} controls className="w-full rounded-[24px] border border-white/10 bg-slate-950/45" />
            {audioURL && <audio ref={recordedAudioRef} src={audioURL} controls className="w-full" />}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => recordedVideoRef.current?.play()}
                className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Play Recording Again
              </button>
              <button
                onClick={() => downloadBlob(recordedChunksRef.current, "video/webm", "interview-recording.webm")}
                className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Download Video
              </button>
              <button
                onClick={() => recordedAudioRef.current?.play()}
                disabled={!audioURL}
                className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Play Audio Only
              </button>
              <button
                onClick={() => downloadBlob(recordedAudioChunksRef.current, "audio/webm", "interview-audio.webm")}
                disabled={!recordedAudioChunksRef.current.length}
                className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download Audio
              </button>
            </div>
            <button
              onClick={evaluatePerformance}
              className="inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-emerald-300/20 bg-emerald-400/90 px-5 py-4 font-semibold text-slate-950 transition hover:opacity-95"
            >
              <Sparkles size={18} />
              Evaluate Performance
            </button>
            <p className="text-xs leading-6 text-slate-400">
              {hasProfileAnalysis
                ? `Current profile match score used in the demo flow: ${profileMatchPercentage}%`
                : "Analyze the profile first if you want a real employability score with interview + profile weighting."}
            </p>
          </div>
        )}

        {phase === "processing" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-[24px] border border-cyan-300/20 bg-cyan-400/10 p-4 text-cyan-100">
              <Loader className="animate-spin" size={18} />
              <span className="font-display text-lg">Interview analysis in progress</span>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <ProgressBar percentage={evaluationJob?.progress || 0} label={evaluationJob?.stage || "Preparing analysis"} />
              <p className="mt-4 text-sm text-slate-300">
                Real-time backend stage: <strong className="text-white">{evaluationJob?.stage || "Waiting"}</strong>
              </p>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard title="Interview Feedback" subtitle="Scored output from the backend" icon={Zap}>
        {interviewResult ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricTile
                label="Employability Score"
                value={interviewResult.profile_match_available ? interviewResult.employability_score : "N/A"}
                hint={interviewResult.profile_match_available ? "Profile + interview combined" : "Requires profile analysis first"}
                tone={interviewResult.profile_match_available ? getScoreTone(interviewResult.employability_score) : "slate"}
                icon={Gauge}
              />
              <MetricTile
                label="Interview Score"
                value={interviewResult.interview_score}
                hint="Communication + expression output"
                tone={getScoreTone(interviewResult.interview_score)}
                icon={Activity}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Sentiment</p>
                <p className="mt-2 font-display text-2xl text-white">{interviewResult.communication_analysis?.sentiment}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Dominant Emotion</p>
                <p className="mt-2 font-display text-2xl text-white">{interviewResult.facial_analysis?.emotions?.dominant_emotion}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              <p>{interviewResult.facial_analysis?.feedback}</p>
              <p className="mt-3">{interviewResult.communication_analysis?.clarity_feedback}</p>
            </div>

            <TranscriptHighlighter analysis={interviewResult.communication_analysis?.transcript_analysis} />

            <button
              onClick={downloadReport}
              className="inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-violet-300/20 bg-violet-400/90 px-5 py-4 font-semibold text-slate-950 transition hover:opacity-95"
            >
              <Download size={18} />
              Download Interview Report
            </button>
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[22px] border border-dashed border-white/12 bg-white/4 px-5 text-center text-slate-400 md:min-h-[420px] md:rounded-[26px] md:px-6">
            <Zap className="mb-4 opacity-50" size={52} />
            <p className="font-display text-xl text-white">Complete an interview to unlock the evaluation view.</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              Once a recording is processed, this panel will show the transcript review, facial analysis, and downloadable report.
            </p>
          </div>
        )}
      </GlassCard>
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
  <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
    <GlassCard title="Virtual Career Mentor" subtitle="Gemini-guided, context-aware coaching" icon={MessageCircle}>
      <div className="flex h-[24rem] flex-col rounded-[22px] border border-white/10 bg-slate-950/35 p-3 md:h-[30rem] md:rounded-[26px] md:p-4">
        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {chatHistory.map((msg, index) => (
            <div key={`${msg.type}-${index}`} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-[22px] px-4 py-3 text-sm shadow-lg ${
                  msg.type === "user"
                    ? "rounded-br-md bg-[linear-gradient(135deg,#0ea5e9,#14b8a6)] text-slate-950"
                    : "rounded-tl-md border border-white/10 bg-white/8 text-slate-100"
                }`}
              >
                <p className="whitespace-pre-wrap break-words leading-7">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-[22px] rounded-tl-md border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-300">
                <Loader className="mr-2 inline animate-spin" size={14} />
                Mentor is typing...
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2 md:gap-3">
          <input
            type="text"
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            placeholder={recommendedDomain === "Unknown" ? "Analyze your profile first to chat..." : `Ask about ${recommendedDomain}, skills, jobs, or interviews`}
            className="flex-1 rounded-[18px] border border-white/10 bg-white/6 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-300/30 md:rounded-[20px] md:px-4"
            disabled={isLoading || recommendedDomain === "Unknown"}
            onKeyDown={(e) => e.key === "Enter" && handleChatQuery()}
          />
          <button
            onClick={handleChatQuery}
            className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition md:rounded-[20px] md:px-5 ${
              isLoading || recommendedDomain === "Unknown"
                ? "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
                : "border border-cyan-300/20 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
            }`}
            disabled={isLoading || recommendedDomain === "Unknown"}
          >
            Send
          </button>
        </div>
      </div>
    </GlassCard>

    <div className="space-y-8">
      <GlassCard title="Mentor Context" subtitle="Grounded in live analysis" icon={Bot}>
        {analysisResult ? (
          <div className="space-y-4">
            <MetricTile label="Target Domain" value={recommendedDomain} hint="Primary recommendation" tone="violet" icon={Target} />
            <MetricTile label="Profile Match" value={`${analysisResult.profile_match_percentage}%`} hint="Live score from analysis" tone={getScoreTone(analysisResult.profile_match_percentage)} icon={Gauge} />
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Top Missing Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(analysisResult.skill_gap_analysis?.missing_skills || []).slice(0, 5).map((skill) => (
                  <SkillChip key={skill} skill={skill} type="danger" />
                ))}
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              Use this panel during the presentation to show that the mentor replies are linked to the student’s actual role-fit output.
            </p>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/12 bg-white/4 p-8 text-center text-slate-400">
            Analyze a profile first so the mentor can answer with real student context.
          </div>
        )}
      </GlassCard>
    </div>
  </div>
);

const DashboardView = ({ analytics, readiness }) => (
  <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
    <GlassCard title="Live Session Analytics" subtitle="Presentation-friendly metrics" icon={Activity}>
      <div className="grid gap-4 md:grid-cols-2">
        <MetricTile label="Profiles Analyzed" value={analytics?.profiles_analyzed ?? 0} hint="Current session count" tone="blue" icon={User} />
        <MetricTile label="Interviews Completed" value={analytics?.interviews_completed ?? 0} hint="Recorded and evaluated" tone="emerald" icon={Video} />
        <MetricTile label="Average Profile Match" value={`${analytics?.average_profile_match ?? 0}%`} hint="Role-fit average" tone="amber" icon={Gauge} />
        <MetricTile label="Average Employability" value={analytics?.average_employability_score ?? 0} hint="Combined output average" tone="violet" icon={Sparkles} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Top Domain</p>
          <p className="mt-2 font-display text-2xl text-white">{analytics?.top_recommended_domain || "No data yet"}</p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Top Skill Gap</p>
          <p className="mt-2 font-display text-2xl text-white">{analytics?.top_skill_gap?.skill || "No data yet"}</p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Mentor Messages</p>
          <p className="mt-2 font-display text-2xl text-white">{analytics?.mentor_messages ?? 0}</p>
        </div>
      </div>
    </GlassCard>

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
  const profileResultsRef = useRef(null);

  const profileMatchPercentage = analysisResult?.profile_match_percentage || 0;
  const hasProfileAnalysis = Boolean(analysisResult);
  const recommendedDomain = analysisResult?.career_recommendations?.[0] || "Unknown";

  const loadDashboardData = async () => {
    try {
      const [readinessRes, analyticsRes] = await Promise.all([fetch(`${API_BASE_URL}/readiness`), fetch(`${API_BASE_URL}/session_analytics`)]);
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

  useEffect(() => {
    if (analysisResult && currentView === "profile") {
      profileResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysisResult, currentView]);

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
    <AppShell>
      <div className="mx-auto max-w-[1600px] px-3 py-3 pb-28 sm:px-4 lg:px-8 lg:py-8 lg:pb-8">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
            <div className="mb-4 rounded-[26px] border border-white/10 bg-slate-950/55 p-4 shadow-[0_20px_70px_rgba(2,8,23,0.28)] backdrop-blur-xl lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                  <Layout size={28} />
                </div>
                <div>
                  <p className="font-display text-xl text-white">Career Pilot AI</p>
                  <p className="text-sm text-slate-400">Mobile presentation mode</p>
                </div>
              </div>
            </div>

            <div className="hidden h-full flex-col rounded-[34px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_30px_90px_rgba(2,8,23,0.32)] backdrop-blur-xl lg:flex">
              <div className="mb-8 rounded-[28px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(20,184,166,0.08),rgba(255,255,255,0.04))] p-5">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                  <Layout size={28} />
                </div>
                <p className="font-display text-2xl text-white">Career Pilot AI</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">A sharper, stage-ready interface for your placement-readiness demo.</p>
              </div>

              <div className="space-y-3">
                {NAV_ITEMS.map((item) => (
                  <NavButton key={item.view} item={item} currentView={currentView} setCurrentView={setCurrentView} />
                ))}
              </div>

              <div className="mt-auto rounded-[26px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Presentation Tip</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Start with Profile, then show Mentor, then run Interview. It gives the examiner the cleanest narrative arc.
                </p>
              </div>
            </div>
          </aside>

          <main className="space-y-5 lg:space-y-6">
            <SectionHero
              currentView={currentView}
              readiness={readiness}
              recommendedDomain={recommendedDomain}
              profileMatchPercentage={profileMatchPercentage}
              analytics={analytics}
            />

            {error && (
              <div className="rounded-[24px] border border-rose-300/20 bg-rose-400/10 px-5 py-4 text-rose-100 shadow-[0_20px_60px_rgba(244,63,94,0.12)]">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} />
                  <span>{error}</span>
                </div>
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
                resultsRef={profileResultsRef}
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
                hasProfileAnalysis={hasProfileAnalysis}
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
          </main>
        </div>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-30 lg:hidden">
        <div className="grid grid-cols-4 gap-2 rounded-[24px] border border-white/10 bg-slate-950/75 p-2 shadow-[0_24px_80px_rgba(2,8,23,0.42)] backdrop-blur-2xl">
          {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
            const active = currentView === view;
            return (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`flex flex-col items-center justify-center rounded-[18px] px-2 py-2.5 text-[11px] font-medium transition ${
                  active ? "bg-cyan-400 text-slate-950 shadow-[0_14px_30px_rgba(34,211,238,0.26)]" : "text-slate-300 hover:bg-white/8"
                }`}
              >
                <Icon size={18} />
                <span className="mt-1">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
