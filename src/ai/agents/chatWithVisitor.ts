import { generateText } from "ai";
import type { ModelMessage } from "ai";
import { TEXT_MODEL, TEXT_MODEL_FALLBACK_1, TEXT_MODEL_FALLBACK_2 } from "@/ai/providers/gateway";
import { buildVisitorSystemPrompt } from "@/ai/prompts/visitorAssistant";
import { withFallback } from "@/ai/lib/withFallback";

export async function chatWithVisitor(messages: ModelMessage[]): Promise<string> {
  const firstUserIdx = messages.findIndex((m) => m.role === "user");
  if (firstUserIdx === -1) return "Please ask me a question!";

  const system = await buildVisitorSystemPrompt();
  const conversation = messages.slice(firstUserIdx);

  const { text } = await withFallback([
    () => generateText({ model: TEXT_MODEL, system, messages: conversation }),
    () => generateText({ model: TEXT_MODEL_FALLBACK_1, system, messages: conversation }),
    () => generateText({ model: TEXT_MODEL_FALLBACK_2, system, messages: conversation }),
  ]);

  return text;
}
