import { NextResponse } from "next/server";
import { getKTDocuments } from "@/db/queries";

export async function GET() {
  try {
    const docs = await getKTDocuments();
    return NextResponse.json({ docs });
  } catch (err) {
    console.error("KT docs list error:", err);
    return NextResponse.json({ docs: [] });
  }
}
