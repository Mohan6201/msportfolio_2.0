import PipelineTemplate from "./PipelineTemplate";
import TerminalTemplate from "./TerminalTemplate";
import DashboardTemplate from "./DashboardTemplate";
import CorporateTemplate from "./CorporateTemplate";
import BlueprintTemplate from "./BlueprintTemplate";
import MinimalTemplate from "./MinimalTemplate";
import SarathStyleTemplate from "./SarathStyleTemplate";

export const TEMPLATES = [
  { key: "pipeline",    name: "Pipeline",     description: "Dark · sidebar + numbered sections · CI/CD aesthetic", component: PipelineTemplate },
  { key: "terminal",    name: "Terminal",      description: "Dark · zsh terminal window · tech commands as headers", component: TerminalTemplate },
  { key: "dashboard",   name: "Dashboard",     description: "Dark · metric cards header · experience timeline", component: DashboardTemplate },
  { key: "corporate",   name: "Corporate",     description: "Light · two-column sidebar · professional blue", component: CorporateTemplate },
  { key: "blueprint",   name: "Blueprint",     description: "Light · engineering schematic · graph paper grid", component: BlueprintTemplate },
  { key: "minimal",     name: "Minimal",       description: "Light · pure ATS-friendly · clean single column", component: MinimalTemplate },
  { key: "sarath",      name: "Sarath Style",  description: "Dark header · bold name · two-column experience cards", component: SarathStyleTemplate },
] as const;

export type TemplateKey = typeof TEMPLATES[number]["key"];
