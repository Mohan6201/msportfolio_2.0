import { eq, desc, sql } from "drizzle-orm";
import { db } from "./client";
import { contacts, blogComments, newsletter, ktDocuments } from "./schema/legacy";
import { projects } from "./schema/profile";

// ── Contacts ─────────────────────────────────────────────────────────────────

export async function insertContact(
  name: string,
  email: string,
  message: string,
  ip?: string
) {
  await db.insert(contacts).values({ name, email, message, ip });
}

export async function getAllContacts() {
  return db.select().from(contacts).orderBy(desc(contacts.createdAt));
}

export async function markContactRead(id: number) {
  await db.update(contacts).set({ read: 1 }).where(eq(contacts.id, id));
}

// ── Blog comments ─────────────────────────────────────────────────────────────

export async function insertComment(
  slug: string,
  author: string,
  email: string,
  body: string,
  ip?: string
) {
  await db.insert(blogComments).values({ postSlug: slug, author, email, body, ip });
}

export async function getApprovedComments(slug: string) {
  return db
    .select({
      id: blogComments.id,
      author: blogComments.author,
      body: blogComments.body,
      createdAt: blogComments.createdAt,
    })
    .from(blogComments)
    .where(eq(blogComments.postSlug, slug))
    .orderBy(blogComments.createdAt);
}

export async function getAllComments() {
  return db.select().from(blogComments).orderBy(desc(blogComments.createdAt));
}

export async function setCommentApproval(id: number, approved: 0 | 1) {
  await db.update(blogComments).set({ approved }).where(eq(blogComments.id, id));
}

export async function deleteComment(id: number) {
  await db.delete(blogComments).where(eq(blogComments.id, id));
}

// ── Newsletter ─────────────────────────────────────────────────────────────────

export async function insertSubscriber(email: string) {
  await db.insert(newsletter).values({ email }).onConflictDoNothing();
}

export async function getAllSubscribers() {
  return db
    .select({ id: newsletter.id, email: newsletter.email, createdAt: newsletter.createdAt })
    .from(newsletter)
    .orderBy(desc(newsletter.createdAt));
}

// ── KT Documents ──────────────────────────────────────────────────────────────

export async function insertKTDocument(
  title: string,
  filename: string,
  category: string,
  level: string,
  fileData: Buffer
) {
  await db
    .insert(ktDocuments)
    .values({ title, filename, category, level, fileData, fileSize: fileData.length })
    .onConflictDoUpdate({
      target: ktDocuments.filename,
      set: { title, category, level, fileData, fileSize: fileData.length },
    });
}

export async function getKTDocuments() {
  return db
    .select({
      id: ktDocuments.id,
      title: ktDocuments.title,
      filename: ktDocuments.filename,
      category: ktDocuments.category,
      level: ktDocuments.level,
      fileSize: ktDocuments.fileSize,
      uploadedAt: ktDocuments.uploadedAt,
    })
    .from(ktDocuments)
    .orderBy(desc(ktDocuments.uploadedAt));
}

export async function getKTDocumentFile(id: number) {
  const rows = await db
    .select({ title: ktDocuments.title, filename: ktDocuments.filename, fileData: ktDocuments.fileData })
    .from(ktDocuments)
    .where(eq(ktDocuments.id, id));
  return rows[0] ?? null;
}

export async function deleteKTDocument(id: number) {
  await db.delete(ktDocuments).where(eq(ktDocuments.id, id));
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getStats() {
  const [c, cm, n] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)`,
        unread: sql<number>`sum(case when ${contacts.read}=0 then 1 else 0 end)`,
      })
      .from(contacts),
    db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`sum(case when ${blogComments.approved}=0 then 1 else 0 end)`,
      })
      .from(blogComments),
    db.select({ total: sql<number>`count(*)` }).from(newsletter),
  ]);
  return {
    contacts: c[0],
    comments: cm[0],
    subscribers: n[0],
  };
}

export async function getDashboardStats() {
  const [projCount, ktCount, msgStats, recentProjects, recentKTDocs] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(projects),
    db.select({ count: sql<number>`count(*)` }).from(ktDocuments),
    db.select({
      total: sql<number>`count(*)`,
      unread: sql<number>`sum(case when ${contacts.read}=0 then 1 else 0 end)`,
    }).from(contacts),
    db.select({ id: projects.id, name: projects.name, year: projects.year, sortOrder: projects.sortOrder })
      .from(projects).orderBy(desc(projects.sortOrder)).limit(4),
    db.select({ id: ktDocuments.id, title: ktDocuments.title, uploadedAt: ktDocuments.uploadedAt, category: ktDocuments.category })
      .from(ktDocuments).orderBy(desc(ktDocuments.uploadedAt)).limit(4),
  ]);
  return {
    projectCount: Number(projCount[0]?.count ?? 0),
    ktDocCount: Number(ktCount[0]?.count ?? 0),
    unreadMessages: Number(msgStats[0]?.unread ?? 0),
    totalMessages: Number(msgStats[0]?.total ?? 0),
    recentProjects,
    recentKTDocs,
  };
}
