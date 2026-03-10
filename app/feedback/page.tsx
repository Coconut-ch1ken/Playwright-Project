"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FeedbackData {
  strengths: string[];
  weaknesses: string[];
}

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("feedbackData");
    if (!stored) {
      router.push("/");
      return;
    }
    setFeedback(JSON.parse(stored));
  }, [router]);

  if (!feedback) {
    return (
      <div className="root-layout flex-center min-h-screen">
        <p className="text-light-400">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="root-layout">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-4xl font-bold text-white">Interview Feedback</h1>
        <p className="text-light-400">
          Here&apos;s how you did in your mock interview
        </p>
      </div>

      {/* Feedback Panels */}
      <div className="flex gap-6 max-lg:flex-col w-full">
        {/* Strengths Panel */}
        <div className="flex-1">
          <div className="card-border w-full">
            <div className="card p-6 flex flex-col gap-4 min-h-[400px]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success-100/20">
                  <span className="text-lg">✅</span>
                </div>
                <h2 className="text-xl font-bold text-success-100">
                  Things You Did Well
                </h2>
              </div>

              <hr className="border-light-800" />

              <ul className="flex flex-col gap-3 list-none">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <span className="text-success-100 font-bold mt-0.5 shrink-0">
                      {index + 1}.
                    </span>
                    <p className="text-light-100 text-sm leading-relaxed">
                      {strength}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Weaknesses Panel */}
        <div className="flex-1">
          <div className="card-border w-full">
            <div className="card p-6 flex flex-col gap-4 min-h-[400px]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f59e0b]/20">
                  <span className="text-lg">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-[#f59e0b]">
                  Areas for Improvement
                </h2>
              </div>

              <hr className="border-light-800" />

              <ul className="flex flex-col gap-3 list-none">
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <span className="text-[#f59e0b] font-bold mt-0.5 shrink-0">
                      {index + 1}.
                    </span>
                    <p className="text-light-100 text-sm leading-relaxed">
                      {weakness}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            sessionStorage.removeItem("interviewData");
            sessionStorage.removeItem("feedbackData");
            router.push("/");
          }}
          className="btn-primary"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
