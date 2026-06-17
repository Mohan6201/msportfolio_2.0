import Link from "next/link";
import { FileText, Briefcase, Mic, TrendingUp, ArrowRight, Lock } from "lucide-react";

const TOOLS = [
  {
    icon: FileText,
    title: "Resume Studio",
    desc: "Upload your resume, choose from 7 professional templates, get ATS scores, generate cover letters, and export to PDF.",
    tags: ["7 Templates", "ATS Scoring", "AI Cover Letter"],
    href: "/account/resume",
    color: "cyan",
    badge: "Popular",
  },
  {
    icon: Briefcase,
    title: "Job Tracker",
    desc: "Paste job descriptions and get instant match scores against your resume. Track applications and pipeline stages.",
    tags: ["JD Match %", "Application Board", "Pipeline"],
    href: "/account/jobs",
    color: "green",
    badge: null,
  },
  {
    icon: Mic,
    title: "Interview Lab",
    desc: "AI-powered mock interviews tailored to DevOps and AWS roles. Get instant feedback on your answers.",
    tags: ["DevOps Q&A", "Instant Feedback", "Role-specific"],
    href: "/account/interview",
    color: "orange",
    badge: "AI-Powered",
  },
  {
    icon: TrendingUp,
    title: "Career Advisor",
    desc: "Analyze your career progression, identify skill gaps, and get a personalized roadmap to your next role.",
    tags: ["Skill Gap Analysis", "Roadmap", "Salary Insights"],
    href: "/account/career",
    color: "purple",
    badge: null,
  },
] as const;

export default function CareerCentreSection() {
  return (
    <section id="career-centre" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <p className="section-tag mb-4">Exclusive Platform</p>
            <h2 className="font-special text-2xl sm:text-4xl font-bold text-white">
              Career <span className="gradient-text">Centre</span>
            </h2>
            <p className="text-lightGrey text-xs sm:text-sm font-mono mt-3 max-w-md">
              A suite of AI-powered career tools built specifically for DevOps &amp; Cloud engineers.
              Free to use — just create an account.
            </p>
          </div>
          <Link
            href="/account/signup"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan text-black font-mono font-bold text-sm hover:bg-lightCyan transition-colors shadow-cyanShadow flex-shrink-0 self-stretch sm:self-auto"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const colorMap: Record<string, string> = {
              cyan:   "text-cyan   border-cyan/25   bg-cyan/8   shadow-cyan/10",
              green:  "text-green  border-green/25  bg-green/8  shadow-green/10",
              orange: "text-orange border-orange/25 bg-orange/8 shadow-orange/10",
              purple: "text-purple border-purple/25 bg-purple/8 shadow-purple/10",
            };
            const tagMap: Record<string, string> = {
              cyan:   "badge-cyan",
              green:  "badge-green",
              orange: "badge-orange",
              purple: "badge-purple",
            };
            const hoverMap: Record<string, string> = {
              cyan:   "group-hover:text-cyan",
              green:  "group-hover:text-green",
              orange: "group-hover:text-orange",
              purple: "group-hover:text-purple",
            };
            const textMap: Record<string, string> = {
              cyan:   "text-cyan",
              green:  "text-green",
              orange: "text-orange",
              purple: "text-purple",
            };
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="glass glass-hover rounded-2xl p-5 border border-white/5 flex flex-col gap-4 group relative overflow-hidden"
              >
                {/* Badge */}
                {tool.badge && (
                  <span className={`absolute top-3 right-3 text-[9px] font-mono px-2 py-0.5 rounded-full border ${colorMap[tool.color]}`}>
                    {tool.badge}
                  </span>
                )}

                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorMap[tool.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-special font-bold text-base text-white mb-2 ${hoverMap[tool.color]} transition-colors`}>
                    {tool.title}
                  </h3>
                  <p className="text-lightGrey text-xs font-mono leading-relaxed">{tool.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((t) => (
                    <span key={t} className={`badge ${tagMap[tool.color]} text-[9px]`}>{t}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-lightGrey/40">
                    <Lock className="w-3 h-3" /> Login required
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-mono ${textMap[tool.color]}`}>
                    Launch <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass border border-cyan/10">
          <div>
            <p className="text-white font-mono font-semibold text-sm">Already using these tools?</p>
            <p className="text-lightGrey text-xs font-mono mt-0.5">Sign in to access your saved resumes, job matches, and interview history.</p>
          </div>
          <Link
            href="/account/login"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-cyan/30 text-cyan text-sm font-mono hover:bg-cyan/8 transition-all flex-shrink-0 self-stretch sm:self-auto"
          >
            Sign In <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
