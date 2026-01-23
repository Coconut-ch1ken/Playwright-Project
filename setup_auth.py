from playwright.sync_api import sync_playwright

def run(playwright):
    # Launch Firefox in headed mode so you can see the login screen
    browser = playwright.firefox.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    print("Navigating to login page...")
    page.goto("https://waterlooworks.uwaterloo.ca/home.htm", wait_until="domcontentloaded")

    # Perform the login steps
    print("Please log in manually and approve Duo Mobile...")
    page.get_by_role("link", name="Students/Alumni/Staff").click()
    
    # We will wait up to 5 minutes for you to finish logging in and approved Duo
    # The goal is to reach the dashboard or a logged-in state
    try:
        page.wait_for_url("**/dashboard.htm", timeout=300000) 
        print("Login detected! Saving state...")
        
        # Save the authenticated state
        context.storage_state(path="./config/auth.json")
        print("✅ Auth state saved to config/auth.json")
    except:
        print("❌ Timed out waiting for dashboard. Did you log in?")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
