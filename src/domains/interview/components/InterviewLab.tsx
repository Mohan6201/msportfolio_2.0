"use client";
import { useState } from "react";
import QuestionBank from "./QuestionBank";
import MockInterview from "./MockInterview";

type View = "bank" | "practice";

export default function InterviewLab() {
  const [view, setView] = useState<View>("bank");
  const [practiceCategory, setPracticeCategory] = useState("AWS");
  const [practiceAvailable, setPracticeAvailable] = useState(5);

  function startPractice(category: string, available: number) {
    setPracticeCategory(category);
    setPracticeAvailable(available);
    setView("practice");
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-7">
        <nav className="flex items-center gap-1.5 text-[11px] font-mono mb-3" style={{ color: "#6B7280" }}>
          <span>Career Centre</span>
          <span className="opacity-40">/</span>
          <span className="text-white">Interview Lab</span>
        </nav>
        <h1 className="text-white text-[28px] font-bold mb-1">Interview Lab</h1>
        <p className="text-sm font-mono" style={{ color: "#6B7280" }}>
          Browse questions · Practice with AI feedback · Track performance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6" style={{ borderBottom: "1px solid #26262B" }}>
        {(["bank", "practice"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-2 text-xs font-mono rounded-t-lg transition-colors border-b-2"
            style={
              view === v
                ? { color: "#00D964", borderColor: "#00D964" }
                : { color: "#6B7280", borderColor: "transparent" }
            }
          >
            {v === "bank" ? "Question Bank" : `Practice${view === "practice" ? ` · ${practiceCategory}` : ""}`}
          </button>
        ))}
      </div>

      {view === "bank" && <QuestionBank onStartPractice={startPractice} />}
      {view === "practice" && (
        <MockInterview category={practiceCategory} available={practiceAvailable} onBack={() => setView("bank")} />
      )}
    </div>
  );
}
