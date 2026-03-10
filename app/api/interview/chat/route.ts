import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(request: Request) {
  try {
    const { messages, questions, jobTitle } = await request.json();

    const questionList = (questions as string[])
      .map((q: string, i: number) => `${i + 1}. ${q}`)
      .join("\n");

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: `You are a professional job interviewer conducting a mock interview for the role of "${jobTitle || "the position"}". Your goal is to assess the candidate's qualifications, motivation, and fit for the role.

Interview Guidelines:
- Ask the following questions one at a time, in order:
${questionList}

- Start by introducing yourself and asking the first question.
- After the candidate responds, acknowledge their answer briefly and naturally, then move to the next question.
- If a response is vague, ask ONE brief follow-up before moving on.
- Be professional yet warm and welcoming.
- Keep your responses concise — this is a text-based interview, so be clear and to the point.
- Do NOT ask multiple questions at once.
- After all questions have been asked, thank the candidate and let them know the interview is complete.

Important: Track which questions you have already asked. Do not repeat questions. Do not skip questions unless the candidate has already answered them.`,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Interview chat error:", error);
    return new Response("Failed to process interview chat", { status: 500 });
  }
}
