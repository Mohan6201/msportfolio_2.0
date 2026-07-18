import MinimalTemplate from "./MinimalTemplate";
import TerminalTemplate from "./TerminalTemplate";
import BlueprintTemplate from "./BlueprintTemplate";
import SarathStyleTemplate from "./SarathStyleTemplate";
import PipelineTemplate from "./PipelineTemplate";
import CorporateTemplate from "./CorporateTemplate";
import DashboardTemplate from "./DashboardTemplate";

// Ordered by ATS-parsing risk, safest first — not alphabetical, not arbitrary. Verified by
// reading every template's actual layout, not guessed:
// - "safe": strict single-column, top-to-bottom reading order, nothing that could scramble
//   text order when an ATS parser strips styling.
// - "caution": single-column overall, but with a smaller structural risk (SarathStyle puts a
//   per-experience-entry "Tools" list in its own grid column, next to — not below — the
//   bullets it belongs with).
// - "creative": whole-page or component-level sidebar layouts (Pipeline, Corporate, Dashboard's
//   card grid), where a parser reading DOM/visual order can interleave or drop sidebar text.
export const TEMPLATES = [
  { key: "minimal",   name: "Minimal",       description: "Light · pure ATS-friendly · clean single column",                atsSafe: "safe" as const,     component: MinimalTemplate },
  { key: "terminal",  name: "Terminal",      description: "Dark · zsh terminal window · single column, tech commands as headers", atsSafe: "safe" as const,     component: TerminalTemplate },
  { key: "blueprint", name: "Blueprint",     description: "Light · engineering schematic · single column, graph paper grid", atsSafe: "safe" as const,     component: BlueprintTemplate },
  { key: "sarath",    name: "Sarath Style",  description: "Dark header · bold name · per-entry tools column",               atsSafe: "caution" as const,  component: SarathStyleTemplate },
  { key: "pipeline",  name: "Pipeline",      description: "Dark · sidebar + numbered sections · CI/CD aesthetic",           atsSafe: "creative" as const, component: PipelineTemplate },
  { key: "corporate", name: "Corporate",     description: "Light · two-column sidebar · professional blue",                 atsSafe: "creative" as const, component: CorporateTemplate },
  { key: "dashboard", name: "Dashboard",     description: "Dark · metric cards header · card-grid layout",                  atsSafe: "creative" as const, component: DashboardTemplate },
] as const;

export type TemplateKey = typeof TEMPLATES[number]["key"];
export type AtsSafeTier = typeof TEMPLATES[number]["atsSafe"];
