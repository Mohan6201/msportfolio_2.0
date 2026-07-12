import { embed } from "ai";
import { EMBED_MODEL, EMBED_PROVIDER_OPTIONS } from "@/ai/providers/gateway";

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: EMBED_MODEL, value: text, providerOptions: EMBED_PROVIDER_OPTIONS });
  return embedding;
}

export function serializeEmbedding(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
