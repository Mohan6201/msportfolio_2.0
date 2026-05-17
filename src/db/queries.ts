import { db } from "./client";

// ── Contacts ─────────────────────────────────────────────────────────────────

export async function insertContact(
  name: string,
  email: string,
  message: string,
  ip?: string
) {
  await db.execute({
    sql: "INSERT INTO contacts (name, email, message, ip) VALUES (?, ?, ?, ?)",
    args: [name, email, message, ip ?? null],
  });
}

export async function getAllContacts() {
  const r = await db.execute(
    "SELECT * FROM contacts ORDER BY created_at DESC"
  );
  return r.rows;
}

export async function markContactRead(id: number) {
  await db.execute({ sql: "UPDATE contacts SET read=1 WHERE id=?", args: [id] });
}

// ── Blog comments ─────────────────────────────────────────────────────────────

export async function insertComment(
  slug: string,
  author: string,
  email: string,
  body: string,
  ip?: string
) {
  await db.execute({
    sql: "INSERT INTO blog_comments (post_slug, author, email, body, ip) VALUES (?, ?, ?, ?, ?)",
    args: [slug, author, email, body, ip ?? null],
  });
}

export async function getApprovedComments(slug: string) {
  const r = await db.execute({
    sql: "SELECT id, author, body, created_at FROM blog_comments WHERE post_slug=? AND approved=1 ORDER BY created_at ASC",
    args: [slug],
  });
  return r.rows;
}

export async function getAllComments() {
  const r = await db.execute(
    "SELECT * FROM blog_comments ORDER BY created_at DESC"
  );
  return r.rows;
}

export async function setCommentApproval(id: number, approved: 0 | 1) {
  await db.execute({
    sql: "UPDATE blog_comments SET approved=? WHERE id=?",
    args: [approved, id],
  });
}

export async function deleteComment(id: number) {
  await db.execute({ sql: "DELETE FROM blog_comments WHERE id=?", args: [id] });
}

// ── Newsletter ─────────────────────────────────────────────────────────────────

export async function insertSubscriber(email: string) {
  await db.execute({
    sql: "INSERT OR IGNORE INTO newsletter (email) VALUES (?)",
    args: [email],
  });
}

export async function getAllSubscribers() {
  const r = await db.execute(
    "SELECT id, email, created_at FROM newsletter ORDER BY created_at DESC"
  );
  return r.rows;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getStats() {
  const [c, cm, n] = await Promise.all([
    db.execute("SELECT COUNT(*) as total, SUM(CASE WHEN read=0 THEN 1 ELSE 0 END) as unread FROM contacts"),
    db.execute("SELECT COUNT(*) as total, SUM(CASE WHEN approved=0 THEN 1 ELSE 0 END) as pending FROM blog_comments"),
    db.execute("SELECT COUNT(*) as total FROM newsletter"),
  ]);
  return {
    contacts: c.rows[0],
    comments: cm.rows[0],
    subscribers: n.rows[0],
  };
}
