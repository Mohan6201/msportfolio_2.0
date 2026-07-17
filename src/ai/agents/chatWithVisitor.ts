import { generateText } from "ai";
import type { ModelMessage } from "ai";
import { CHAT_MODEL, CHAT_MODEL_FALLBACK } from "@/ai/providers/gateway";
import { buildVisitorSystemPrompt } from "@/ai/prompts/visitorAssistant";
import { withFallback } from "@/ai/lib/withFallback";

export async function chatWithVisitor(messages: ModelMessage[]): Promise<string> {
  const firstUserIdx = messages.findIndex((m) => m.role === "user");
  if (firstUserIdx === -1) return "Please ask me a question!";

  const system = await buildVisitorSystemPrompt();
  const conversation = messages.slice(firstUserIdx);

  const { text } = await withFallback([
    () => generateText({ model: CHAT_MODEL, system, messages: conversation }),
    () => generateText({ model: CHAT_MODEL_FALLBACK, system, messages: conversation }),
  ]);

  return text;
}
