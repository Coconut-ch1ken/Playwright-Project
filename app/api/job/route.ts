import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const projectRoot = path.resolve(process.cwd());
    const scriptPath = path.join(projectRoot, "scrape_job.py");

    // Try to use the Python from the project's .venv first, otherwise fall back to system python
    const pythonPaths = [
      path.join(projectRoot, ".venv", "bin", "python"),
      "python3",
      "python",
    ];

    let result = null;
    let lastError = null;

    for (const pythonPath of pythonPaths) {
      try {
        const { stdout, stderr } = await execAsync(
          `"${pythonPath}" "${scriptPath}" "${jobId}"`,
          {
            cwd: projectRoot,
            timeout: 60000, // 60 second timeout
          }
        );

        if (stderr) {
          console.error("Scraper stderr:", stderr);
        }

        result = JSON.parse(stdout.trim());
        break;
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    if (!result) {
      console.error("All Python paths failed:", lastError);
      return NextResponse.json(
        {
          error:
            "Failed to run scraper. Ensure Python and Playwright are installed, and auth.json is valid.",
        },
        { status: 500 }
      );
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Job API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
