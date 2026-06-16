import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userJobPreferences = sqliteTable("user_job_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(),
  targetRoles: text("target_roles").notNull().default("[]"),          // JSON string[]
  preferredLocations: text("preferred_locations").notNull().default("[]"), // JSON string[]
  remotePreference: text("remote_preference", {
    enum: ["remote", "hybrid", "onsite", "any"],
  }).notNull().default("any"),
  employmentType: text("employment_type").notNull().default("[]"),    // JSON string[]
  minSalary: integer("min_salary"),
  keywords: text("keywords").notNull().default("[]"),                 // JSON string[]
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});
