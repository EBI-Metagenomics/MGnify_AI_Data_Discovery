import os
from openai import OpenAI

API_KEY = os.environ['OPENAI_API_KEY']
if not API_KEY:
    raise ValueError("API key not found. Please set the OPENAI_API_KEY environment variable.")

initial_prompt = """
You are an expert in the EBI MGnify V2 API.
Please help to generate a python script to answer the question. Your response should be based on the given context and follow the response guidelines and format instructions.
"""

guidelines = """
1. If the provided context is sufficient, please generate a valid python script without any explanations of the question or the script.
2. Do not hallucinate or make assumptions about the API. If the context is not sufficient, please respond with "INSUFFICIENT CONTEXT".
3. The result of the python script must be a JSON object containing MGnifyAnalysisDetail objects. If the result would not be of this form please respond with "INVALID REQUEST".
4. The script should be a complete and valid Python script that can be run as is - do not include any markdown or code fences.
5. The script should include necessary import statements and handle any potential exceptions.
6. Do not include anything other than the script in your response.
7. Use the API documentation provided in the context to understand the API endpoints, parameters, and response formats.
"""

# For now this is a static context block to the query
# Aim is to eventually add targeted context based on the query
def get_context():
    with open(f'{os.getcwd()}/oxford_mgnify/schemas/MGnifyAnalysisDetail.json', 'r') as file:
        analysis_detail_schema = file.read()
    with open(f'{os.getcwd()}/oxford_mgnify/schemas/PagedMGnifyAnalysis.json', 'r') as file:
        paged_analysis_schema = file.read()
    with open(f'{os.getcwd()}/oxford_mgnify/schemas/MGnifyStudyDetail.json', 'r') as file:
        study_detail_schema = file.read()
    context = (
        "You have access to the following endpoints. \n" 
        "https://www.ebi.ac.uk/metagenomics/api/v2/analyses/ \n" 
        "This endpoint lists all analyses available from MGnify. The response from this endpoint has the following schema: \n" 
        f"{paged_analysis_schema}\n"
        "https://www.ebi.ac.uk/metagenomics/api/v2/analyses/<analysis_accession> \n"
        "This endpoint gets MGnify analysis by accesion number. This endpoint has the following parameters: \n"
        "page, page_size\n"
        "The response from this endpoint has the following schema:\n"
        f"{analysis_detail_schema}\n"
        "https://www.ebi.ac.uk/metagenomics/api/v2/studies/<study_accession> \n"
        "This endpoint gets the detail of a single study. The response from this endpoign has the following schema:\n"
        f"{study_detail_schema}"
    )
    return context

#Constructs the final prompt, sends the request to the llm and processes the response
def get_script(query):
    prompt = f"{initial_prompt}\n{guidelines}\nContext:\n{get_context()}\n\nQuestion:\n{query}"

    client = OpenAI(api_key=API_KEY)

    response = client.chat.completions.create(
        model="o1-mini",
        messages=[
            {"role": "user", "content": prompt}
        ],
        store=False
    )

    with open(f"{os.getcwd()}/oxford_mgnify/response.py", "w") as file:
        file.write(response.choices[0].message.content)
    
    return response.choices[0].message.content

def main():
    #Example query: Retrieve the analysis run with accession MGYA01000004
    query = input()
    get_script(query)

if __name__ == "__main__":
    main()