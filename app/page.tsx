"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface JobData {
  jobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

export default function HomePage() {
  const router = useRouter();
  const [jobId, setJobId] = useState("");
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    if (!jobId.trim()) return;

    setLoading(true);
    setError("");
    setJobData(null);

    try {
      const res = await fetch("/api/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: jobId.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to fetch job data");
        return;
      }

      setJobData(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!jobData) return;

    setLoading(true);
    setError("");

    try {
      // Generate questions first
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobData.description }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to generate interview questions");
        return;
      }

      // Store data in sessionStorage for the interview page
      sessionStorage.setItem(
        "interviewData",
        JSON.stringify({
          jobTitle: jobData.title,
          company: jobData.company,
          questions: data.questions,
          jobDescription: jobData.description,
        })
      );

      router.push("/interview");
    } catch {
      setError("Failed to prepare interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="root-layout">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white">
          WaterlooWorks Mock Interviewer
        </h1>
        <p className="text-light-400">
          Enter a job ID from WaterlooWorks to start a mock interview powered by
          AI
        </p>
      </div>

      {/* Job ID Input */}
      <div className="flex flex-col gap-4">
        <label className="text-light-100 font-medium">Job ID</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="Enter WaterlooWorks Job ID..."
            className="flex-1 bg-dark-200 rounded-full min-h-12 px-5 text-white placeholder:text-light-400 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200/50"
          />
          <button
            onClick={handleLookup}
            disabled={loading || !jobId.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && !jobData ? "Looking up..." : "Lookup"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive-100/10 border border-destructive-100/30 rounded-xl p-4">
          <p className="text-destructive-100 text-sm">{error}</p>
        </div>
      )}

      {/* Job Description Display */}
      {jobData && (
        <div className="flex flex-col gap-6">
          <div className="card-border">
            <div className="card p-6 flex flex-col gap-4">
              {/* Job Header */}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-white">
                  {jobData.title}
                </h2>
                <div className="flex gap-4">
                  <span className="text-primary-200 font-medium">
                    {jobData.company}
                  </span>
                  {jobData.location && jobData.location !== "Unknown" && (
                    <span className="text-light-400">{jobData.location}</span>
                  )}
                </div>
              </div>

              <hr className="border-light-800" />

              {/* Job Description */}
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <p className="text-light-100 whitespace-pre-wrap leading-relaxed text-sm">
                  {jobData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Start Interview CTA */}
          <div className="card-cta">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-white">
                Ready to practice?
              </h3>
              <p className="text-light-400 text-sm">
                AI will generate tailored interview questions for this role
              </p>
            </div>
            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && jobData
                ? "Preparing Interview..."
                : "Start Interview →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}