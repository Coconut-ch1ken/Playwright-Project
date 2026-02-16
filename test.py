import os

def record_tests():
    os.system("""playwright codegen --browser firefox --load-storage=./config/auth.json https://waterlooworks.uwaterloo.ca/myAccount/dashboard.htm""")

def main():
    record_tests()

if __name__ == "__main__":
    main()  