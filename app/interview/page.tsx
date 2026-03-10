"use client";

import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface InterviewData {
  jobTitle: string;
  company: string;
  questions: string[];
  jobDescription: string;
}

export default function InterviewPage() {
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null
  );
  const [stopping, setStopping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load interview data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("interviewData");
    if (!stored) {
      router.push("/");
      return;
    }
    setInterviewData(JSON.parse(stored));
  }, [router]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/interview/chat",
      body: {
        questions: interviewData?.questions || [],
        jobTitle: interviewData?.jobTitle || "",
      },
      initialMessages: interviewData
        ? [
            {
              id: "system-init",
              role: "assistant",
              content: `Welcome! I'll be conducting your mock interview for the ${interviewData.jobTitle} position at ${interviewData.company}. Let's get started.\n\nPlease introduce yourself briefly, and then we'll dive into the questions.`,
            },
          ]
        : [],
    });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStopInterview = async () => {
    if (messages.length < 2) {
      router.push("/");
      return;
    }

    setStopping(true);

    try {
      const transcript = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const feedback = await res.json();

      if (res.ok && !feedback.error) {
        sessionStorage.setItem("feedbackData", JSON.stringify(feedback));
        router.push("/feedback");
      } else {
        console.error("Feedback error:", feedback.error);
        alert("Failed to generate feedback. Please try again.");
        setStopping(false);
      }
    } catch (error) {
      console.error("Stop interview error:", error);
      alert("Something went wrong. Please try again.");
      setStopping(false);
    }
  };

  if (!interviewData) {
    return (
      <div className="root-layout flex-center min-h-screen">
        <p className="text-light-400">Loading interview...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-800">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">
            Mock Interview: {interviewData.jobTitle}
          </h1>
          <p className="text-sm text-light-400">{interviewData.company}</p>
        </div>
        <button
          onClick={handleStopInterview}
          disabled={stopping}
          className="btn-disconnect disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {stopping ? "Generating Feedback..." : "Stop Interview"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-primary-200 text-dark-100"
                  : "blue-gradient-dark border border-primary-200/20"
              }`}
            >
              <p
                className={`text-sm leading-relaxed ${
                  message.role === "user" ? "!text-dark-100" : "!text-white"
                }`}
              >
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="blue-gradient-dark border border-primary-200/20 rounded-2xl px-4 py-3">
              <p className="text-sm text-light-400 animate-pulse">
                Interviewer is typing...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-light-800">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your answer..."
            disabled={stopping}
            className="flex-1 bg-dark-200 rounded-full min-h-12 px-5 text-white placeholder:text-light-400 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || stopping}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
