from playwright.sync_api import Page
import random
import time

def random_sleep() -> None:
    min = 2
    max = 5
    n = random.uniform(min, max) 
    print(f"Wait for {n} s")
    time.sleep(n)

def humanClick(page: Page, role: str, name: str) -> None:
    page.get_by_role(role, name=name).click()
    random_sleep()
