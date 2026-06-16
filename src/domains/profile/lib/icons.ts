import type { ComponentType } from "react";
import { FaAws, FaDocker, FaJenkins, FaReact, FaLinkedinIn, FaInstagram, FaPython, FaFire } from "react-icons/fa";
import { SiGithubactions, SiKubernetes, SiLinux, SiTerraform, SiGrafana, SiPrometheus, SiHelm, SiVault, SiAnsible, SiDjango, SiGnubash, SiNextdotjs } from "react-icons/si";
import { GiArtificialIntelligence } from "react-icons/gi";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone, FiGithub } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";

type IconComponent = ComponentType<{ className?: string }>;

export const SKILL_ICONS: Record<string, IconComponent> = {
  FaAws, FaDocker, FaJenkins, FaReact, FaPython, FaFire,
  SiGithubactions, SiKubernetes, SiLinux, SiTerraform,
  SiGrafana, SiPrometheus, SiHelm, SiVault, SiAnsible, SiDjango,
  SiGnubash, SiNextdotjs,
  GiArtificialIntelligence,
};

export const SOCIAL_ICONS: Record<string, IconComponent> = {
  FaLinkedinIn, FiGithub, FaInstagram,
};

export const CONTACT_ICONS: Record<string, IconComponent> = {
  HiOutlineMail, FiPhone, IoLocationOutline,
};
