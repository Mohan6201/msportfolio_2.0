"use client";
import { useState } from "react";
import QuestionBank from "./QuestionBank";
import MockInterview from "./MockInterview";

type View = "bank" | "practice";

export default function InterviewLab() {
  const [view, setView] = useState<View>("bank");
  const [practiceCategory, setPracticeCategory] = useState("AWS");

  function startPractice(category: string) {
    setPracticeCategory(category);
    setView("practice");
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {(["bank", "practice"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 text-xs font-mono rounded-t-lg transition-colors border-b-2 ${
              view === v ? "text-cyan border-cyan" : "text-lightGrey border-transparent hover:text-white"
            }`}
          >
            {v === "bank" ? "Question Bank" : `Practice${view === "practice" ? ` · ${practiceCategory}` : ""}`}
          </button>
        ))}
      </div>

      {view === "bank" && <QuestionBank onStartPractice={startPractice} />}
      {view === "practice" && (
        <MockInterview
          category={practiceCategory}
          onBack={() => setView("bank")}
        />
      )}
    </div>
  );
}
