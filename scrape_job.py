#!/usr/bin/env python3
"""
Scrape a single job posting from WaterlooWorks by job ID.

Usage:
    python scrape_job.py <job_id>

Outputs JSON to stdout:
    { "jobId": "...", "title": "...", "company": "...", "location": "...", "description": "..." }

Requires:
    - config/auth.json to exist (run setup_auth.py first)
    - Playwright + Firefox installed
"""

import sys
import json
from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext


def open_browser(playwright) -> tuple[Browser, BrowserContext, Page]:
    """Launch Firefox with saved auth state."""
    browser = playwright.firefox.launch(headless=True)
    context = browser.new_context(storage_state="./config/auth.json")
    page = context.new_page()
    return browser, context, page


def scrape_job_by_id(page: Page, job_id: str) -> dict:
    """Navigate to a specific job posting and extract its details."""
    # Navigate to the job postings search page
    page.goto(
        "https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm",
        wait_until="domcontentloaded",
    )
    page.wait_for_timeout(3000)

    # Search for the job by ID using the search/filter
    search_input = page.locator("input[type='text'][placeholder*='Search']").first
    if search_input.is_visible():
        search_input.fill(job_id)
        search_input.press("Enter")
        page.wait_for_timeout(3000)

    # Try to click on the first matching job link
    job_link = page.locator(f"text={job_id}").first
    if job_link.is_visible():
        job_link.click()
        page.wait_for_timeout(3000)

    # Extract job details from the detail page
    title = ""
    company = ""
    location = ""
    description = ""

    # Try to get the job title
    title_el = page.locator("h1").first
    if title_el.is_visible():
        title = title_el.inner_text().strip()

    # Try to extract all visible text from the job detail area
    # WaterlooWorks uses various layouts, so we grab the main content area
    detail_area = page.locator(".orbisTabContainer, .panel-body, main, [role='main']").first
    if detail_area.is_visible():
        full_text = detail_area.inner_text().strip()

        # Try to parse out company and location from the page
        lines = full_text.split("\n")
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            if "Organization:" in line_stripped or "Company:" in line_stripped:
                company = line_stripped.split(":", 1)[-1].strip()
            elif "Location:" in line_stripped or "Job Location:" in line_stripped:
                location = line_stripped.split(":", 1)[-1].strip()

        description = full_text
    else:
        # Fallback: grab all body text
        description = page.locator("body").inner_text().strip()

    return {
        "jobId": job_id,
        "title": title or f"Job {job_id}",
        "company": company or "Unknown",
        "location": location or "Unknown",
        "description": description,
    }


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python scrape_job.py <job_id>"}), file=sys.stderr)
        sys.exit(1)

    job_id = sys.argv[1]

    with sync_playwright() as playwright:
        browser, context, page = open_browser(playwright)
        try:
            result = scrape_job_by_id(page, job_id)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)
        finally:
            context.close()
            browser.close()


if __name__ == "__main__":
    main()
