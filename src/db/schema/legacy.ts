import { integer, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  ip: text("ip"),
  read: integer("read").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const blogComments = sqliteTable("blog_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postSlug: text("post_slug").notNull(),
  author: text("author").notNull(),
  email: text("email").notNull(),
  body: text("body").notNull(),
  approved: integer("approved").notNull().default(0),
  ip: text("ip"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const newsletter = sqliteTable("newsletter", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const ktDocuments = sqliteTable("kt_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  filename: text("filename").notNull().unique(),
  category: text("category").notNull().default("DevOps"),
  level: text("level").notNull().default("Reference"),
  fileData: blob("file_data", { mode: "buffer" }),
  fileSize: integer("file_size").notNull().default(0),
  storageUrl: text("storage_url"),
  uploadedAt: text("uploaded_at").notNull().default(sql`(datetime('now'))`),
});
