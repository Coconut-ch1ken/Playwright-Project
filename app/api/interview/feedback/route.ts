import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: "Interview transcript is required" },
        { status: 400 }
      );
    }

    const formattedTranscript = transcript
      .map(
        (msg: { role: string; content: string }) =>
          `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content}`
      )
      .join("\n\n");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        strengths: z
          .array(z.string())
          .describe(
            "Specific things the candidate did well during the interview"
          ),
        weaknesses: z
          .array(z.string())
          .describe(
            "Specific areas where the candidate could improve"
          ),
      }),
      prompt: `You are an expert interview coach analyzing a mock interview transcript. Your task is to evaluate the candidate's performance and provide actionable feedback.

Be thorough and honest in your analysis. Don't be lenient — if there are clear mistakes or areas for improvement, point them out specifically. Similarly, highlight genuine strengths with specific examples from the transcript.

Transcript:
${formattedTranscript}

Provide:
- "strengths": A list of 3-6 specific things the candidate did well, with brief explanations referencing what they said.
- "weaknesses": A list of 3-6 specific areas for improvement, with constructive suggestions for how to do better.

Be specific and reference actual responses from the transcript. Avoid generic feedback.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Feedback generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
