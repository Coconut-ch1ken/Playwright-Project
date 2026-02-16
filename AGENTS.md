# Agent Guidelines for Playwright Project

This document provides instructions and standards for AI agents working in this repository.

## 1. Project Overview
- **Type:** Python automation project using Playwright.
- **Goal:** Automate interactions with web applications (specifically WaterlooWorks).
- **Key Files:**
  - `open_brows.py`: Main automation script.
  - `setup_auth.py`: Script to handle manual login and save session state.
  - `utils.py`: Shared helper functions.
  - `config/auth.json`: Stores authenticated browser state.

## 2. Build & Dependency Commands
- **Install Dependencies:**
  ```bash
  pip install -r requirements.txt
  playwright install
  ```
- **Update Dependencies:**
  When adding new packages, update `requirements.txt`:
  ```bash
  pip freeze > requirements.txt
  ```

## 3. Test & Run Commands
- **Run Automation Scripts:**
  ```bash
  python open_brows.py
  python setup_auth.py
  ```
- **Run Tests (Pytest):**
  This project uses `pytest`.
  - **Run all tests:**
    ```bash
    pytest
    ```
  - **Run a single test file:**
    ```bash
    pytest tests/test_example.py
    ```
  - **Run a specific test case:**
    ```bash
    pytest tests/test_example.py::test_name
    ```
  - **Run with specific browser (via pytest-playwright):**
    ```bash
    pytest --browser firefox
    ```

## 4. Code Style & Conventions

### Formatting
- **Indentation:** 4 spaces.
- **Quotes:** Use double quotes (`"`) for strings.
- **Line Length:** Aim for < 100 characters where possible.

### Naming
- **Functions & Variables:** Use `snake_case` (e.g., `open_browser`, `navigate_to_jobs`).
  - *Exception:* Existing helpers in `utils.py` may use `camelCase` (e.g., `humanClick`), but prefer `snake_case` for new code.
- **Classes:** Use `PascalCase`.
- **Files:** Use `snake_case` (e.g., `setup_auth.py`).

### Type Hinting
- **Mandatory:** All function signatures must have type hints.
  ```python
  from playwright.sync_api import Page
  
  def my_function(page: Page, timeout: int = 5000) -> bool:
      ...
  ```
- Use `typing` module (e.g., `List`, `Dict`, `Optional`) or standard types (`list`, `dict`) as appropriate for the Python version.

### Imports
- Place standard library imports first, then third-party, then local.
- Use absolute imports where possible.
  ```python
  import time
  from playwright.sync_api import sync_playwright
  from utils import random_sleep
  ```

### Error Handling
- Use specific exception handling where possible.
- Avoid bare `except:` clauses unless catching a generic crash is explicitly intended (and logged).
- Use `try/finally` blocks for resource cleanup (e.g., closing browser/context).

## 5. Playwright Best Practices
- **Sync API:** Use the synchronous API (`sync_playwright`) as established in the project.
- **Locators:** Prioritize user-facing locators:
  1. `page.get_by_role("button", name="Submit")`
  2. `page.get_by_text("Welcome")`
  3. Avoid XPath or generic CSS selectors unless necessary.
- **Waits:**
  - Avoid `time.sleep()`.
  - Use `page.wait_for_selector()`, `page.wait_for_url()`, or auto-waiting assertions (`expect(locator).to_be_visible()`).
  - *Note:* The project currently uses `random_sleep()` to mimic human behavior. Continue this pattern only where "human-like" delays are required.
- **Authentication:**
  - Use `context = browser.new_context(storage_state="./config/auth.json")` to load saved sessions.

## 6. Directory Structure
```
.
├── config/            # Configuration and auth state
├── requirements.txt   # Python dependencies
├── *.py              # Automation scripts
└── .pytest_cache/    # Pytest cache
```
