"use client";
import { useCallback, useEffect, useState } from "react";
import type { Question } from "@/domains/interview/services/interview.service";

const CATEGORIES = ["AWS", "Docker", "Kubernetes", "Linux", "Terraform", "DevOps", "CI/CD", "Ansible"];

const LEVEL_STYLES: Record<string, React.CSSProperties> = {
  Beginner:     { color: "#00D964", border: "1px solid rgba(0,217,100,0.2)", backgroundColor: "rgba(0,217,100,0.06)" },
  Intermediate: { color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)", backgroundColor: "rgba(96,165,250,0.06)" },
  Advanced:     { color: "#f97316", border: "1px solid rgba(249,115,22,0.2)", backgroundColor: "rgba(249,115,22,0.06)" },
};

function QuestionCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={LEVEL_STYLES[q.level] ?? {}}>
              {q.level}
            </span>
            <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: "#444" }}>{q.category}</span>
          </div>
          <p className="text-white text-sm font-mono leading-relaxed">{q.question}</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex-shrink-0 text-[10px] font-mono rounded px-2 py-1 transition-colors"
          style={{ color: "#00D964", border: "1px solid rgba(0,217,100,0.3)" }}
        >
          {open ? "Hide" : "Answer"}
        </button>
      </div>
      {open && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid #26262B" }}>
          <p className="text-xs font-mono leading-relaxed" style={{ color: "#6B7280" }}>{q.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function QuestionBank({ onStartPractice }: { onStartPractice: (category: string) => void }) {
  const [questions, setQuestions]         = useState<Question[]>([]);
  const [activeCategory, setActiveCategory] = useState("AWS");
  const [loading, setLoading]             = useState(false);

  const load = useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/account/interview/questions?category=${encodeURIComponent(cat)}`);
      setQuestions(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(activeCategory); }, [activeCategory, load]);

  return (
    <div>
      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
            style={
              activeCategory === cat
                ? { color: "#00D964", border: "1px solid rgba(0,217,100,0.4)", backgroundColor: "rgba(0,217,100,0.08)" }
                : { color: "#6B7280", border: "1px solid #26262B", backgroundColor: "#16161A" }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Practice CTA */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono" style={{ color: "#6B7280" }}>{questions.length} questions in {activeCategory}</p>
        <button
          onClick={() => onStartPractice(activeCategory)}
          disabled={questions.length === 0}
          className="text-xs font-mono font-bold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40"
          style={{ backgroundColor: "#00D964", color: "#0a0a0b" }}
        >
          Practice {activeCategory} →
        </button>
      </div>

      {loading && <p className="text-xs font-mono" style={{ color: "#6B7280" }}>Loading…</p>}

      <div className="flex flex-col gap-3">
        {questions.map((q) => <QuestionCard key={q.id} q={q} />)}
        {!loading && questions.length === 0 && (
          <p className="text-xs font-mono text-center py-8" style={{ color: "#444" }}>
            No questions for {activeCategory} yet. Run <code className="text-[11px]" style={{ color: "#6B7280" }}>npm run db:seed-interview</code> to seed the question bank.
          </p>
        )}
      </div>
    </div>
  );
}
