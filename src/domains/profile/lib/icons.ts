import type { ComponentType } from "react";
import { FaAws, FaDocker, FaJenkins, FaReact, FaLinkedinIn, FaInstagram, FaPython, FaWindows } from "react-icons/fa";
import { SiGithubactions, SiLinux, SiTerraform, SiGrafana, SiPrometheus, SiAnsible, SiDjango, SiGnubash, SiNginx } from "react-icons/si";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone, FiGithub } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";

type IconComponent = ComponentType<{ className?: string }>;

export const SKILL_ICONS: Record<string, IconComponent> = {
  FaAws, FaDocker, FaJenkins, FaReact, FaPython, FaWindows,
  SiGithubactions, SiLinux, SiTerraform,
  SiGrafana, SiPrometheus, SiAnsible, SiDjango,
  SiGnubash, SiNginx,
};

export const SOCIAL_ICONS: Record<string, IconComponent> = {
  FaLinkedinIn, FiGithub, FaInstagram,
};

export const CONTACT_ICONS: Record<string, IconComponent> = {
  HiOutlineMail, FiPhone, IoLocationOutline,
};
