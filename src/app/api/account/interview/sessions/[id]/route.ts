import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getInterview, updateInterview } from "@/domains/interview/services/interview.service";
import { evaluateAnswer, generateSessionFeedback } from "@/ai/agents/runMockInterview";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const interview = await getInterview(Number(id), session!.user.id);
  if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(interview);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const interview = await getInterview(Number(id), session!.user.id);
  if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as {
    action: "answer" | "complete";
    question?: string;
    expectedAnswer?: string;
    userAnswer?: string;
  };

  if (body.action === "answer") {
    if (!body.question || !body.userAnswer || !body.expectedAnswer) {
      return NextResponse.json({ error: "question, userAnswer, expectedAnswer required" }, { status: 400 });
    }

    const evaluation = await evaluateAnswer(
      body.question,
      body.expectedAnswer,
      body.userAnswer,
      interview.category
    );

    const transcript = JSON.parse(interview.transcript) as object[];
    transcript.push({
      question: body.question,
      userAnswer: body.userAnswer,
      ...evaluation,
    });

    await updateInterview(interview.id, session!.user.id, {
      transcript: JSON.stringify(transcript),
    });

    return NextResponse.json({ evaluation });
  }

  if (body.action === "complete") {
    const transcript = JSON.parse(interview.transcript) as {
      question: string;
      score: number;
      feedback: string;
    }[];

    if (transcript.length === 0) {
      return NextResponse.json({ error: "No answers to evaluate" }, { status: 400 });
    }

    const sessionFeedback = await generateSessionFeedback(interview.category, transcript);
    await updateInterview(interview.id, session!.user.id, {
      score: sessionFeedback.overallScore,
      feedback: JSON.stringify(sessionFeedback),
    });

    return NextResponse.json({ sessionFeedback });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
