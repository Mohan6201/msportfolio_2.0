"use client";
import { useCallback, useEffect, useState } from "react";
import type { Question } from "@/domains/interview/services/interview.service";

const CATEGORIES = ["AWS", "Docker", "Kubernetes", "Linux", "Terraform", "DevOps", "CI/CD", "Ansible"];
const LEVEL_COLORS: Record<string, string> = {
  Beginner: "text-green border-green/20 bg-green/5",
  Intermediate: "text-cyan border-cyan/20 bg-cyan/5",
  Advanced: "text-orange border-orange/20 bg-orange/5",
};

function QuestionCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${LEVEL_COLORS[q.level] ?? ""}`}>
              {q.level}
            </span>
            <span className="text-[9px] font-mono text-lightGrey/40 uppercase tracking-wider">{q.category}</span>
          </div>
          <p className="text-white text-sm font-mono leading-relaxed">{q.question}</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex-shrink-0 text-[10px] font-mono text-cyan border border-cyan/30 rounded px-2 py-1 hover:bg-cyan/10 transition-colors"
        >
          {open ? "Hide" : "Answer"}
        </button>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-lightGrey text-xs font-mono leading-relaxed">{q.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function QuestionBank({ onStartPractice }: { onStartPractice: (category: string) => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeCategory, setActiveCategory] = useState("AWS");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/account/interview/questions?category=${encodeURIComponent(cat)}`);
      setQuestions(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeCategory); }, [activeCategory, load]);

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
              activeCategory === cat
                ? "bg-cyan/15 border-cyan/40 text-cyan"
                : "bg-white/5 border-white/10 text-lightGrey hover:border-cyan/20 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Practice CTA */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-lightGrey text-xs font-mono">{questions.length} questions in {activeCategory}</p>
        <button
          onClick={() => onStartPractice(activeCategory)}
          disabled={questions.length === 0}
          className="text-xs font-mono bg-cyan text-black font-bold px-4 py-1.5 rounded-lg hover:bg-lightCyan transition-colors disabled:opacity-40"
        >
          Practice {activeCategory} →
        </button>
      </div>

      {loading && <p className="text-lightGrey text-xs font-mono">Loading…</p>}

      <div className="flex flex-col gap-3">
        {questions.map((q) => <QuestionCard key={q.id} q={q} />)}
        {!loading && questions.length === 0 && (
          <p className="text-lightGrey/50 text-xs font-mono text-center py-8">
            No questions for {activeCategory} yet. Run `npm run db:seed-interview` to seed the question bank.
          </p>
        )}
      </div>
    </div>
  );
}
