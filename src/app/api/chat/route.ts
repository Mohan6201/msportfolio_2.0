import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_INSTRUCTION = `You are an AI assistant for Mohana Srinivasan's portfolio website. Answer visitor questions about his professional background concisely (2-4 sentences). Be warm, professional, and helpful.

PROFILE:
• Name: Mohana Srinivasan
• Title: AWS DevOps Engineer
• Experience: 3.5 years (since Apr 2022)
• Location: Hitech City, Hyderabad, India
• Email: mohandevopssme@gmail.com
• LinkedIn: https://www.linkedin.com/in/mohan6201
• GitHub: https://github.com/Mohan6201
• Open to: Full-time DevOps / Cloud Engineer roles

SKILLS:
AWS (EC2, S3, IAM, Route 53, CloudWatch, ECS, CodePipeline), Docker, Kubernetes, GitHub Actions, Python (shell scripting), Django, React, Ansible, Terraform, Jenkins, AI/ML model deployments, Linux, Firebase

EXPERIENCE:
1. Trainee Consultant @ Enterprise SoftLabs (Apr 2022 – Dec 2022)
   – SCM change requests for Maersk, SQL stored procedures in SSMS, Azure/Cisco VPN troubleshooting, Windows Active Directory administration

2. Staff Consultant @ Enterprise SoftLabs (Dec 2022 – Jul 2023)
   – Migrated HighJump → Körber WMS (DB, apps, Bartender, IIS, printers) across DEV/UAT/PROD
   – Managed WMS deployments with high scalability, set up Windows Server 2022

3. AWS DevOps Engineer @ Enterprise SoftLabs (Jul 2023 – Aug 2025)
   – Built CI/CD for Txenia AI/ML WMS using CodePipeline and GitHub Actions
   – Managed AWS infrastructure (EC2, S3, IAM, Route 53) for scalable deployments
   – Monitored with CloudWatch, set up custom alerts
   – Deployed Dockerized services (prediction, data sync, reporting) via ECS

PROJECTS:
• React Portfolio (2025): Firebase hosting, GitHub Actions CI/CD, Framer Motion, Next.js + TypeScript
• Txenia AI/ML WMS App (2023): Django + React, MLflow, Apache Superset, Route 53, ECS — live at txenia.ai
• Good Eggs (2023): HighJump→Körber migration, IIS configuration — goodeggs.com
• Dr.Max (2023): Warehouse operations, Bartender config, stored procedures — drmax.eu

CERTIFICATIONS:
• DevOps Certified Expert (Guvi, in-progress 2025)
• AWS Solutions Architect Associate (RedSys9, Apr 2025)
• Warehouse Advantage Certified Associate (Körber, Sep 2023)
• Full Stack Developer (3Edge Solutions, Dec 2022)

RULES:
– Never make up information not listed above.
– For hiring or collaboration questions: direct to the contact form or mohandevopssme@gmail.com.
– Keep responses under 5 sentences.
– If asked something unrelated to Mohana's profile, politely redirect to his professional background.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    // Gemini history must start with a user message — skip any leading assistant messages (e.g. welcome)
    const firstUserIdx = messages.findIndex((m) => m.role === "user");
    if (firstUserIdx === -1) {
      return NextResponse.json({ reply: "Please ask me a question!" });
    }

    const conversation = messages.slice(firstUserIdx);

    // Build history (all turns except the final one which we send as the new message)
    const history = conversation.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = conversation[conversation.length - 1];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to get response. Please try again." },
      { status: 500 }
    );
  }
}
