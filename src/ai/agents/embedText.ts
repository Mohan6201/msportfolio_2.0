import { embed } from "ai";
import { EMBED_MODEL } from "@/ai/providers/gateway";

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: EMBED_MODEL, value: text });
  return embedding;
}

export function serializeEmbedding(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
