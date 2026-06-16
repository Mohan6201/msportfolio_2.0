"use client";
import { useState } from "react";
import type { Question } from "@/domains/interview/services/interview.service";
import type { AnswerEval, SessionFeedback } from "@/ai/agents/runMockInterview";

type SessionState = "idle" | "active" | "evaluating" | "complete";

type TranscriptEntry = {
  question: string;
  userAnswer: string;
  evaluation: AnswerEval;
};

export default function MockInterview({
  category,
  onBack,
}: {
  category: string;
  onBack: () => void;
}) {
  const [state, setState] = useState<SessionState>("idle");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [lastEval, setLastEval] = useState<AnswerEval | null>(null);
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
      body: JSON.stringify({
        action: "answer",
        question: q.question,
        expectedAnswer: q.answer,
        userAnswer: answer.trim(),
      }),
    });
    const { evaluation } = await res.json() as { evaluation: AnswerEval };
    setLastEval(evaluation);
    setTranscript((prev) => [...prev, { question: q.question, userAnswer: answer.trim(), evaluation }]);
    setAnswer("");
    setState("active");
  }

  async function next() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setLastEval(null);
    } else {
      await complete();
    }
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
  const isLast = currentIndex + 1 >= questions.length;

  if (state === "idle") {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-white font-mono font-bold text-base mb-2">{category} Mock Interview</h3>
        <p className="text-lightGrey text-xs font-mono mb-6 max-w-xs mx-auto">
          5 questions picked from the {category} question bank. Type your answers; AI scores each one and gives feedback.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onBack} className="text-xs font-mono text-lightGrey border border-white/10 rounded-lg px-4 py-2 hover:text-white hover:border-white/30 transition-colors">
            ← Back
          </button>
          <button onClick={start} className="text-xs font-mono bg-cyan text-black font-bold rounded-lg px-6 py-2 hover:bg-lightCyan transition-colors">
            Start
          </button>
        </div>
      </div>
    );
  }

  if (state === "complete" && sessionFeedback) {
    const gradeColors: Record<string, string> = { A: "text-green", B: "text-cyan", C: "text-yellow-400", D: "text-orange", F: "text-red-400" };
    return (
      <div className="space-y-5">
        <div className="glass rounded-xl border border-cyan/20 p-5 text-center">
          <p className={`font-special text-5xl font-bold ${gradeColors[sessionFeedback.grade] ?? "text-white"}`}>{sessionFeedback.grade}</p>
          <p className="text-white font-mono font-bold text-lg mt-1">{sessionFeedback.overallScore}%</p>
          <p className="text-lightGrey text-xs font-mono mt-2">{sessionFeedback.summary}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass rounded-xl border border-white/10 p-4">
            <h4 className="text-green text-xs font-mono font-bold mb-2 uppercase tracking-wider">Strong Areas</h4>
            <ul className="space-y-1">{sessionFeedback.strongAreas.map((s, i) => <li key={i} className="text-lightGrey text-xs font-mono flex gap-2"><span className="text-green">▸</span>{s}</li>)}</ul>
          </div>
          <div className="glass rounded-xl border border-white/10 p-4">
            <h4 className="text-orange text-xs font-mono font-bold mb-2 uppercase tracking-wider">Needs Work</h4>
            <ul className="space-y-1">{sessionFeedback.improvementAreas.map((s, i) => <li key={i} className="text-lightGrey text-xs font-mono flex gap-2"><span className="text-orange">▸</span>{s}</li>)}</ul>
          </div>
        </div>
        <div className="glass rounded-xl border border-white/10 p-4">
          <h4 className="text-cyan text-xs font-mono font-bold mb-1 uppercase tracking-wider">Next Step</h4>
          <p className="text-lightGrey text-xs font-mono">{sessionFeedback.recommendation}</p>
        </div>
        <div className="space-y-3">
          <h4 className="text-lightGrey text-xs font-mono font-bold uppercase tracking-wider">Answer Review</h4>
          {transcript.map((t, i) => (
            <div key={i} className="glass rounded-xl border border-white/10 p-4">
              <p className="text-white text-xs font-mono font-bold mb-1">Q{i + 1}: {t.question}</p>
              <p className="text-lightGrey text-xs font-mono mb-2 italic">"{t.userAnswer}"</p>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-mono font-bold ${t.evaluation.score >= 7 ? "text-green" : t.evaluation.score >= 4 ? "text-yellow-400" : "text-red-400"}`}>{t.evaluation.score}/10</span>
                <p className="text-lightGrey/70 text-[10px] font-mono">{t.evaluation.feedback}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { setState("idle"); setSessionFeedback(null); setTranscript([]); }} className="w-full text-xs font-mono border border-white/10 rounded-lg py-2 text-lightGrey hover:text-white hover:border-white/30 transition-colors">
          Practice Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white/10 rounded-full h-1.5">
          <div className="bg-cyan h-1.5 rounded-full transition-all" style={{ width: `${((currentIndex) / questions.length) * 100}%` }} />
        </div>
        <span className="text-xs font-mono text-lightGrey">{currentIndex + 1} / {questions.length}</span>
      </div>

      {/* Question */}
      {currentQ && (
        <div className="glass rounded-xl border border-cyan/20 p-5">
          <p className="text-[10px] font-mono text-cyan/60 uppercase tracking-wider mb-2">Question {currentIndex + 1}</p>
          <p className="text-white font-mono text-sm leading-relaxed">{currentQ.question}</p>
        </div>
      )}

      {/* Last eval */}
      {lastEval && (
        <div className={`glass rounded-xl border p-4 ${lastEval.score >= 7 ? "border-green/20" : lastEval.score >= 4 ? "border-yellow-400/20" : "border-red-400/20"}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`font-mono font-bold text-lg ${lastEval.score >= 7 ? "text-green" : lastEval.score >= 4 ? "text-yellow-400" : "text-red-400"}`}>{lastEval.score}/10</span>
            <p className="text-lightGrey text-xs font-mono">{lastEval.feedback}</p>
          </div>
          {lastEval.keyMissing.length > 0 && (
            <p className="text-orange text-[10px] font-mono">Missing: {lastEval.keyMissing.join(", ")}</p>
          )}
          <button onClick={next} className="mt-3 w-full text-xs font-mono bg-white/10 border border-white/10 rounded-lg py-2 text-white hover:bg-white/20 transition-colors">
            {isLast ? "View Results →" : "Next Question →"}
          </button>
        </div>
      )}

      {/* Answer input (shown if no eval yet) */}
      {!lastEval && state !== "evaluating" && (
        <div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="Type your answer here…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono resize-none focus:outline-none focus:border-cyan/40 transition-colors"
          />
          <button
            onClick={submitAnswer}
            disabled={!answer.trim()}
            className="mt-2 w-full text-xs font-mono bg-cyan text-black font-bold rounded-lg py-2.5 hover:bg-lightCyan transition-colors disabled:opacity-40"
          >
            Submit Answer
          </button>
        </div>
      )}

      {state === "evaluating" && (
        <div className="text-center py-4">
          <p className="text-lightGrey text-xs font-mono">Evaluating…</p>
        </div>
      )}
    </div>
  );
}
