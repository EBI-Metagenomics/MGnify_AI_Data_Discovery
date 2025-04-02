from llmfunctions import text_to_api

def main(user_query = "green frogs"):
    return text_to_api(user_query)

query = input("enter query:")
main(query)