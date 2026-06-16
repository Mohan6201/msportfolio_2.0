import { NextRequest, NextResponse } from "next/server";
import { embedText, serializeEmbedding } from "@/ai/agents/embedText";
import { libsqlClient } from "@/db/client";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  try {
    const embedding = await embedText(q);
    const vecJson = serializeEmbedding(embedding);

    const rows = await libsqlClient.execute({
      sql: `
        SELECT
          kc.content,
          kc.document_id,
          kd.title,
          kd.category,
          kd.level,
          kd.storage_url,
          vector_distance_cos(kc.embedding, vector32(?)) AS distance
        FROM kt_chunks kc
        JOIN kt_documents kd ON kd.id = kc.document_id
        ORDER BY distance ASC
        LIMIT 5
      `,
      args: [vecJson],
    });

    const results = rows.rows.map((r) => ({
      content: r[0] as string,
      documentId: r[1] as number,
      title: r[2] as string,
      category: r[3] as string,
      level: r[4] as string,
      storageUrl: r[5] as string | null,
      distance: r[6] as number,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("KT search error:", err);
    // Fall back to simple text search if vector ops unavailable
    const fallback = await libsqlClient.execute({
      sql: "SELECT id, title, category, level, storage_url FROM kt_documents WHERE title LIKE ? LIMIT 5",
      args: [`%${q}%`],
    });
    const results = fallback.rows.map((r) => ({
      documentId: r[0] as number,
      title: r[1] as string,
      category: r[2] as string,
      level: r[3] as string,
      storageUrl: r[4] as string | null,
      content: "",
      distance: 1,
    }));
    return NextResponse.json({ results });
  }
}
