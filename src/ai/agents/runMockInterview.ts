import { generateObject } from "ai";
import { z } from "zod";
import { TEXT_MODEL, TEXT_MODEL_FALLBACK_1, GROQ_BEST_EFFORT_OPTIONS, TEXT_MODEL_FALLBACK_2 } from "@/ai/providers/gateway";
import { withFallback } from "@/ai/lib/withFallback";

const answerEvalSchema = z.object({
  score: z.number().min(0).max(10),
  feedback: z.string(),
  keyMissing: z.array(z.string()),
  strengths: z.array(z.string()),
});

export type AnswerEval = z.infer<typeof answerEvalSchema>;

export async function evaluateAnswer(
  question: string,
  expectedAnswer: string,
  userAnswer: string,
  category: string
): Promise<AnswerEval> {
  const prompt = `You are a senior ${category} interview coach.

Question: ${question}

Reference answer: ${expectedAnswer}

Candidate's answer: ${userAnswer}

Evaluate the candidate's answer:
- Score from 0-10 (10 = perfect, 7+ = good, 4-6 = partial, below 4 = insufficient)
- Give concise, constructive feedback (2-3 sentences)
- List key points that were missing or incorrect (max 4)
- List specific strengths shown in the answer (max 3)
Be direct and honest. Don't inflate scores.

Return the result as this exact JSON shape:
{ "score": number (0-10), "feedback": string, "keyMissing": string[], "strengths": string[] }`;

  const { object } = await withFallback([
    () => generateObject({ model: TEXT_MODEL, schema: answerEvalSchema, prompt }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_1, schema: answerEvalSchema, prompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_2, schema: answerEvalSchema, prompt }),
  ]);
  return object;
}

const sessionFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  grade: z.string(),
  summary: z.string(),
  strongAreas: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  recommendation: z.string(),
});

export type SessionFeedback = z.infer<typeof sessionFeedbackSchema>;

export async function generateSessionFeedback(
  category: string,
  questionScores: { question: string; score: number; feedback: string }[]
): Promise<SessionFeedback> {
  const avgScore = questionScores.reduce((s, q) => s + q.score, 0) / questionScores.length;
  const scoreText = questionScores.map((q, i) => `Q${i + 1}: "${q.question}" — Score: ${q.score}/10 — ${q.feedback}`).join("\n");

  const prompt = `You are evaluating a ${category} interview practice session.

Individual question results:
${scoreText}

Average score: ${avgScore.toFixed(1)}/10

Generate an overall session feedback report:
- overallScore: percentage 0-100 (based on average)
- grade: one of "A", "B", "C", "D", "F"
- summary: 2 sentences on overall performance
- strongAreas: topics/areas they performed well in
- improvementAreas: topics they need to study more
- recommendation: one concrete next step

Return the result as this exact JSON shape:
{ "overallScore": number (0-100), "grade": "A"|"B"|"C"|"D"|"F", "summary": string, "strongAreas": string[], "improvementAreas": string[], "recommendation": string }`;

  const { object } = await withFallback([
    () => generateObject({ model: TEXT_MODEL, schema: sessionFeedbackSchema, prompt }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_1, schema: sessionFeedbackSchema, prompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_2, schema: sessionFeedbackSchema, prompt }),
  ]);
  return object;
}
