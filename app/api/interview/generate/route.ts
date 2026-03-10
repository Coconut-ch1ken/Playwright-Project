import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        questions: z
          .array(z.string())
          .min(5)
          .max(8)
          .describe("Interview questions based on the job description"),
      }),
      prompt: `You are a professional job interviewer. Based on the following job description, generate 5 to 8 interview questions.

Mix behavioral and technical questions appropriate for the role. Questions should be clear, professional, and directly relevant to the job requirements and responsibilities listed.

Do NOT use special characters like "/" or "*" that might break a text display.

Job Description:
${jobDescription}

Return the questions as an array of strings.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
