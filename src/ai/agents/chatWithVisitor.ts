import { generateText } from "ai";
import type { ModelMessage } from "ai";
import { CHAT_MODEL } from "@/ai/providers/gateway";
import { buildVisitorSystemPrompt } from "@/ai/prompts/visitorAssistant";

export async function chatWithVisitor(messages: ModelMessage[]): Promise<string> {
  const firstUserIdx = messages.findIndex((m) => m.role === "user");
  if (firstUserIdx === -1) return "Please ask me a question!";

  const { text } = await generateText({
    model: CHAT_MODEL,
    system: await buildVisitorSystemPrompt(),
    messages: messages.slice(firstUserIdx),
  });

  return text;
}
