"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiStar, FiGitBranch, FiExternalLink, FiUsers, FiBook } from "react-icons/fi";

const GITHUB_USERNAME = "Mohan6201";

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#2b7489",
  Python:     "#3572A5",
  Go:         "#00ADD8",
  Java:       "#b07219",
  CSS:        "#563d7c",
  HTML:       "#e34c26",
  Shell:      "#89e051",
  Dockerfile: "#384d54",
  HCL:        "#844FBA",
  YAML:       "#cb171e",
  Rust:       "#dea584",
  "C++":      "#f34b7d",
  C:          "#555555",
};

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  updated_at: string;
  topics: string[];
}

interface UserStats {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  avatarUrl: string;
}

function RepoCard({ repo, index }: { repo: Repo; index: number }) {
  const langColor = repo.language ? (LANG_COLORS[repo.language] ?? "#8b949e") : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="glass glass-hover rounded-xl p-5 border border-white/5 flex flex-col gap-3 group"
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-2">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-semibold text-sm text-cyan hover:text-lightCyan transition-colors leading-snug break-all"
        >
          {repo.name}
        </a>
        {repo.fork && (
          <span className="badge badge-cyan shrink-0 text-[10px]">fork</span>
        )}
      </div>

      {/* Description */}
      <p className="text-lightGrey/70 text-xs leading-relaxed line-clamp-2 flex-1">
        {repo.description ?? "No description provided."}
      </p>

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.topics.slice(0, 3).map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-lightGrey/60 border border-white/5">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-3 text-xs font-mono text-lightGrey/50">
          {langColor && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: langColor }} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1"><FiStar className="w-3 h-3" />{repo.stargazers_count}</span>
          <span className="flex items-center gap-1"><FiGitBranch className="w-3 h-3" />{repo.forks_count}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noopener noreferrer"
              className="w-6 h-6 flex items-center justify-center rounded-md bg-cyan/10 border border-cyan/20 text-cyan hover:bg-cyan/20 transition-colors">
              <FiExternalLink className="w-3 h-3" />
            </a>
          )}
          <a href={repo.html_url} target="_blank" rel="noopener noreferrer"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-lightGrey hover:text-white hover:bg-white/10 transition-colors">
            <FiGithub className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function GitHubStats() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`),
        ]);
        if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API error");

        const user = await userRes.json();
        const allRepos: Repo[] = await reposRes.json();

        const nonForkRepos = allRepos.filter((r) => !r.fork);
        const totalStars = allRepos.reduce((s, r) => s + r.stargazers_count, 0);

        setStats({
          publicRepos: user.public_repos ?? 0,
          followers: user.followers ?? 0,
          following: user.following ?? 0,
          totalStars,
          avatarUrl: user.avatar_url ?? "",
        });
        setRepos(nonForkRepos);
      } catch {
        /* silently degrade */
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const visibleRepos = showAll ? repos : repos.slice(0, 9);

  return (
    <section id="github" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-10 sm:mb-14"
        >
          <p className="section-tag mb-4">Open Source</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 className="font-special text-2xl sm:text-4xl font-bold text-white">
              GitHub <span className="gradient-text">Repositories</span>
            </h2>
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-mono text-lightGrey hover:text-cyan transition-colors"
            >
              <FiGithub className="w-4 h-4" />@{GITHUB_USERNAME} →
            </a>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-4 sm:p-5 border border-white/5 mb-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        >
          {/* Avatar + profile link */}
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 group shrink-0"
          >
            {stats?.avatarUrl ? (
              <img
                src={stats.avatarUrl}
                alt={GITHUB_USERNAME}
                className="w-14 h-14 rounded-full border-2 border-cyan/30 group-hover:border-cyan/60 transition-colors"
              />
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-orange/30 flex items-center justify-center bg-white/5">
                <FiGithub className="w-7 h-7 text-lightGrey" />
              </div>
            )}
            <div>
              <p className="font-mono font-bold text-white group-hover:text-cyan transition-colors">@{GITHUB_USERNAME}</p>
              <p className="text-xs font-mono text-lightGrey/50 mt-0.5">View full profile →</p>
            </div>
          </a>

          <div className="hidden sm:block w-px h-12 bg-white/5" />

          {/* Aggregate stats */}
          <div className="flex flex-wrap gap-6 sm:gap-8 justify-center">
            {[
              { icon: FiBook,  label: "Repositories", value: stats?.publicRepos },
              { icon: FiStar,  label: "Total Stars",   value: stats?.totalStars },
              { icon: FiUsers, label: "Followers",     value: stats?.followers },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-orange" />
                  <span className="text-2xl font-bold font-mono text-cyan tabular-nums">
                    {loading ? (
                      <span className="inline-block w-8 h-6 rounded bg-white/10 animate-pulse" />
                    ) : (value ?? 0)}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-mono text-lightGrey/50">{label}</p>
              </div>
            ))}
          </div>

          <div className="ml-auto hidden lg:flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="text-xs font-mono text-lightGrey/50">Live data</span>
          </div>
        </motion.div>

        {/* Repo grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 border border-white/5 h-36 animate-pulse" />
            ))}
          </div>
        ) : repos.length === 0 ? (
          <div className="terminal p-8 text-center">
            <p className="terminal-prompt">$ gh repo list {GITHUB_USERNAME}</p>
            <p className="terminal-output mt-2">No repositories found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleRepos.map((repo, i) => (
                <RepoCard key={repo.id} repo={repo} index={i} />
              ))}
            </div>

            {repos.length > 9 && (
              <div className="flex justify-center mt-8">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAll((v) => !v)}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-sm font-mono text-lightGrey hover:border-cyan/30 hover:text-cyan transition-all duration-200"
                >
                  {showAll ? "Show less ↑" : `Show all ${repos.length} repos ↓`}
                </motion.button>
              </div>
            )}
          </>
        )}

        {/* GitHub contribution graph embed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass rounded-2xl p-6 border border-white/5"
        >
          <p className="text-xs font-mono text-lightGrey/50 mb-4">Contribution Activity</p>
          <div className="overflow-x-auto rounded-xl">
            <img
              src={`https://ghchart.rshah.org/00d4ff/${GITHUB_USERNAME}`}
              alt="GitHub contribution chart"
              className="w-full min-w-[600px] rounded-lg opacity-90"
              style={{ filter: "saturate(1.4) brightness(1.1)" }}
            />
          </div>
          <p className="text-[10px] font-mono text-lightGrey/30 mt-3 text-center">
            Powered by ghchart.rshah.org · updated daily
          </p>
        </motion.div>
      </div>
    </section>
  );
}
