from playwright.sync_api import Playwright, sync_playwright, Page, Browser, BrowserContext
from utils import humanClick, random_sleep

def open_browser(playwright: Playwright) -> tuple[Browser, BrowserContext, Page]:
    # Use Firefox to match the setup script
    browser = playwright.firefox.launch(headless=False)
    random_sleep()
    
    # Load the authenticatd state
    context = browser.new_context(storage_state="./config/auth.json")
    page = context.new_page()
    random_sleep()
    return browser, context, page

def navigate_to_jobs(page: Page) -> None:
    print("Navigating to dashboard...")
    # Go directly to the dashboard, skipping login
    page.goto("https://waterlooworks.uwaterloo.ca/myAccount/dashboard.htm", wait_until="domcontentloaded")
    random_sleep()
    
    # Now continue with your automation
    print("Navigating to Jobs...")
    humanClick(page, "link", "Co-op Jobs")
    humanClick(page, "link", "View Full-Cycle Service Job")
    humanClick(page, "button", "All Jobs")
    
    # Your filter logic
    humanClick(page, "button", "My Program toggle_off")
    humanClick(page, "button", "Level keyboard_arrow_down")
    
    # Note: nth(5) is a bit fragile, keeping it as is for now
    page.get_by_text("toggle_off").nth(5).click()
    page.wait_for_timeout(2000)
    
    humanClick(page, "link", "Engineering Intern-Full-stack")
    humanClick(page, "button", "Close")

    # Keep it open for 5 seconds so you can see it worked
    page.wait_for_timeout(5000)

if __name__ == "__main__":
    playwright = sync_playwright().start()
    
    # Capture the returned objects
    browser, context, page = open_browser(playwright)
    
    # Pass the page object to the next function
    navigate_to_jobs(page)
    
    # Cleanup properly using local variables
    context.close()
    browser.close()
    playwright.stop()