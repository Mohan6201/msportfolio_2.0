import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Single profile row — always id = 1
export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull().default(""),
  location: text("location").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  avatarUrl: text("avatar_url"),
  careerStartDate: text("career_start_date").notNull(), // ISO date: "2022-04-01"
  currentCompany: text("current_company").notNull().default(""),
  currentDesignation: text("current_designation").notNull().default(""),
  resumeUrl: text("resume_url"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
});

export const socialLinks = sqliteTable("social_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  label: text("label").notNull(),
  iconKey: text("icon_key").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const skills = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category", { enum: ["cloud", "devops", "backend", "monitoring"] }).notNull(),
  level: integer("level").notNull(), // 0-100
  iconKey: text("icon_key").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const experiences = sqliteTable("experiences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  companyUrl: text("company_url"),
  startDate: text("start_date").notNull(), // e.g. "SEP 2025"
  endDate: text("end_date"),               // null means current
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
  tech: text("tech").notNull().default("[]"),           // JSON string[]
  responsibilities: text("responsibilities").notNull().default("[]"), // JSON string[]
  sortOrder: integer("sort_order").notNull().default(0),
});

export const certifications = sqliteTable("certifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  link: text("link"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  year: text("year").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  link: text("link").notNull(),
  githubUrl: text("github_url"),
  tech: text("tech").notNull().default("[]"),           // JSON string[]
  responsibilities: text("responsibilities").notNull().default("[]"), // JSON string[]
  align: text("align", { enum: ["left", "right"] }).notNull().default("left"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Generic key-value config store
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
