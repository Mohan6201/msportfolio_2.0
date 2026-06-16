"use client";
import { useState } from "react";
import type { Question } from "@/domains/interview/services/interview.service";
import type { AnswerEval, SessionFeedback } from "@/ai/agents/runMockInterview";

type SessionState = "idle" | "active" | "evaluating" | "complete";
type TranscriptEntry = { question: string; userAnswer: string; evaluation: AnswerEval };

function scoreStyle(score: number): React.CSSProperties {
  if (score >= 7) return { color: "#00D964" };
  if (score >= 4) return { color: "#fbbf24" };
  return { color: "#ef4444" };
}

function evalBorderStyle(score: number): React.CSSProperties {
  if (score >= 7) return { backgroundColor: "#16161A", border: "1px solid rgba(0,217,100,0.2)" };
  if (score >= 4) return { backgroundColor: "#16161A", border: "1px solid rgba(251,191,36,0.2)" };
  return { backgroundColor: "#16161A", border: "1px solid rgba(239,68,68,0.2)" };
}

export default function MockInterview({ category, onBack }: { category: string; onBack: () => void }) {
  const [state, setState]               = useState<SessionState>("idle");
  const [sessionId, setSessionId]       = useState<number | null>(null);
  const [questions, setQuestions]       = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer]             = useState("");
  const [transcript, setTranscript]     = useState<TranscriptEntry[]>([]);
  const [lastEval, setLastEval]         = useState<AnswerEval | null>(null);
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedback | null>(null);

  async function start() {
    setState("evaluating");
    const res = await fetch("/api/account/interview/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    const { interview, questions: qs } = await res.json() as { interview: { id: number }; questions: Question[] };
    setSessionId(interview.id);
    setQuestions(qs);
    setCurrentIndex(0);
    setTranscript([]);
    setLastEval(null);
    setState("active");
  }

  async function submitAnswer() {
    if (!answer.trim() || sessionId === null) return;
    setState("evaluating");
    const q = questions[currentIndex];
    const res = await fetch(`/api/account/interview/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "answer", question: q.question, expectedAnswer: q.answer, userAnswer: answer.trim() }),
    });
    const { evaluation } = await res.json() as { evaluation: AnswerEval };
    setLastEval(evaluation);
    setTranscript((prev) => [...prev, { question: q.question, userAnswer: answer.trim(), evaluation }]);
    setAnswer("");
    setState("active");
  }

  async function next() {
    if (currentIndex + 1 < questions.length) { setCurrentIndex((i) => i + 1); setLastEval(null); }
    else await complete();
  }

  async function complete() {
    if (sessionId === null) return;
    setState("evaluating");
    const res = await fetch(`/api/account/interview/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    });
    const { sessionFeedback: fb } = await res.json() as { sessionFeedback: SessionFeedback };
    setSessionFeedback(fb);
    setState("complete");
  }

  const currentQ = questions[currentIndex];
  const isLast   = currentIndex + 1 >= questions.length;

  const gradeStyle: Record<string, React.CSSProperties> = {
    A: { color: "#00D964" }, B: { color: "#60a5fa" }, C: { color: "#fbbf24" },
    D: { color: "#f97316" }, F: { color: "#ef4444" },
  };

  if (state === "idle") {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-white font-mono font-bold text-base mb-2">{category} Mock Interview</h3>
        <p className="text-xs font-mono mb-6 max-w-xs mx-auto" style={{ color: "#6B7280" }}>
          5 questions picked from the {category} question bank. Type your answers; AI scores each one and gives feedback.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="text-xs font-mono rounded-lg px-4 py-2 transition-colors"
            style={{ color: "#6B7280", border: "1px solid #26262B" }}
          >
            ← Back
          </button>
          <button
            onClick={start}
            className="text-xs font-mono font-bold rounded-lg px-6 py-2 transition-colors"
            style={{ backgroundColor: "#00D964", color: "#0a0a0b" }}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  if (state === "complete" && sessionFeedback) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl p-5 text-center" style={{ backgroundColor: "#16161A", border: "1px solid rgba(0,217,100,0.2)" }}>
          <p className="text-5xl font-bold font-mono" style={gradeStyle[sessionFeedback.grade] ?? { color: "white" }}>
            {sessionFeedback.grade}
          </p>
          <p className="text-white font-mono font-bold text-lg mt-1">{sessionFeedback.overallScore}%</p>
          <p className="text-xs font-mono mt-2" style={{ color: "#6B7280" }}>{sessionFeedback.summary}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
            <h4 className="text-xs font-mono font-bold mb-2 uppercase tracking-wider" style={{ color: "#00D964" }}>Strong Areas</h4>
            <ul className="space-y-1">
              {sessionFeedback.strongAreas.map((s, i) => (
                <li key={i} className="text-xs font-mono flex gap-2" style={{ color: "#6B7280" }}>
                  <span style={{ color: "#00D964" }}>▸</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
            <h4 className="text-xs font-mono font-bold mb-2 uppercase tracking-wider" style={{ color: "#f97316" }}>Needs Work</h4>
            <ul className="space-y-1">
              {sessionFeedback.improvementAreas.map((s, i) => (
                <li key={i} className="text-xs font-mono flex gap-2" style={{ color: "#6B7280" }}>
                  <span style={{ color: "#f97316" }}>▸</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
          <h4 className="text-xs font-mono font-bold mb-1 uppercase tracking-wider" style={{ color: "#60a5fa" }}>Next Step</h4>
          <p className="text-xs font-mono" style={{ color: "#6B7280" }}>{sessionFeedback.recommendation}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: "#6B7280" }}>Answer Review</h4>
          {transcript.map((t, i) => (
            <div key={i} className="rounded-xl p-4" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
              <p className="text-white text-xs font-mono font-bold mb-1">Q{i + 1}: {t.question}</p>
              <p className="text-xs font-mono mb-2 italic" style={{ color: "#6B7280" }}>&ldquo;{t.userAnswer}&rdquo;</p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold" style={scoreStyle(t.evaluation.score)}>{t.evaluation.score}/10</span>
                <p className="text-[10px] font-mono" style={{ color: "#6B7280" }}>{t.evaluation.feedback}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setState("idle"); setSessionFeedback(null); setTranscript([]); }}
          className="w-full text-xs font-mono rounded-lg py-2 transition-colors"
          style={{ color: "#6B7280", border: "1px solid #26262B" }}
        >
          Practice Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: "#26262B" }}>
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${(currentIndex / questions.length) * 100}%`, backgroundColor: "#00D964" }}
          />
        </div>
        <span className="text-xs font-mono" style={{ color: "#6B7280" }}>{currentIndex + 1} / {questions.length}</span>
      </div>

      {/* Question card */}
      {currentQ && (
        <div className="rounded-xl p-5" style={{ backgroundColor: "#16161A", border: "1px solid rgba(0,217,100,0.2)" }}>
          <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "rgba(0,217,100,0.6)" }}>
            Question {currentIndex + 1}
          </p>
          <p className="text-white font-mono text-sm leading-relaxed">{currentQ.question}</p>
        </div>
      )}

      {/* Last eval */}
      {lastEval && (
        <div className="rounded-xl p-4" style={evalBorderStyle(lastEval.score)}>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono font-bold text-lg" style={scoreStyle(lastEval.score)}>{lastEval.score}/10</span>
            <p className="text-xs font-mono" style={{ color: "#6B7280" }}>{lastEval.feedback}</p>
          </div>
          {lastEval.keyMissing.length > 0 && (
            <p className="text-[10px] font-mono" style={{ color: "#f97316" }}>Missing: {lastEval.keyMissing.join(", ")}</p>
          )}
          <button
            onClick={next}
            className="mt-3 w-full text-xs font-mono rounded-lg py-2 text-white transition-colors"
            style={{ backgroundColor: "#26262B", border: "1px solid #26262B" }}
          >
            {isLast ? "View Results →" : "Next Question →"}
          </button>
        </div>
      )}

      {/* Answer input */}
      {!lastEval && state !== "evaluating" && (
        <div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="Type your answer here…"
            className="w-full rounded-xl px-4 py-3 text-white text-xs font-mono resize-none focus:outline-none transition-colors placeholder-[#333]"
            style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
          />
          <button
            onClick={submitAnswer}
            disabled={!answer.trim()}
            className="mt-2 w-full text-xs font-mono font-bold rounded-lg py-2.5 transition-colors disabled:opacity-40"
            style={{ backgroundColor: "#00D964", color: "#0a0a0b" }}
          >
            Submit Answer
          </button>
        </div>
      )}

      {state === "evaluating" && (
        <div className="text-center py-4">
          <p className="text-xs font-mono" style={{ color: "#6B7280" }}>Evaluating…</p>
        </div>
      )}
    </div>
  );
}
