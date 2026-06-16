import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

export const experienceItemSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  responsibilities: z.array(z.string()),
  technologies: z.array(z.string()),
});

export const educationItemSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.string().optional(),
});

export const skillGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const certificationItemSchema = z.object({
  title: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
  url: z.string().optional(),
});

export const projectItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  url: z.string().optional(),
  githubUrl: z.string().optional(),
});

export const resumeDataSchema = z.object({
  contact: contactSchema,
  summary: z.string().optional(),
  experiences: z.array(experienceItemSchema),
  education: z.array(educationItemSchema),
  skills: z.array(skillGroupSchema),
  certifications: z.array(certificationItemSchema),
  projects: z.array(projectItemSchema),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
