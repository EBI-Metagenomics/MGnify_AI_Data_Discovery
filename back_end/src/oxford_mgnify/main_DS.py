import os
import requests
from openai import OpenAI
import chromadb


API_KEY = os.environ['OPENAI_API_KEY']
DS_API_KEY = os.environ['DEEPSEEK_API_KEY']
if not DS_API_KEY:
    raise ValueError("API key not found. Please set the DEEPSEEK_API_KEY environment variable.")
openai_client = OpenAI(api_key=API_KEY)

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
8. Use only the context provided, details from the query about the API or any biomes should not be used in your response.
"""

def get_biomes(query):
    chroma_client = chromadb.PersistentClient(path=f'{os.getcwd()}/src/oxford_mgnify/chromadb')
    collection = chroma_client.get_collection(name="lineages")

    query_embedding = openai_client.embeddings.create(input=query, model="text-embedding-3-small").data[0].embedding
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=10
    )
    biomes = (
        "The biome referenced by a lineage is the final item in the lineage, where items are split by ':' \n"
        "Any individual item in the lineage is also a valid biome\n"
        "If the query references information that does not reference the biome, it may be found in the title field of the study\n"
        "Here are some lineages for biomes which may be relevant.\n"
    )
    for lineage in results['documents'][0]:
        biomes += f'{lineage}\n'
    return biomes



def get_context(query):
    with open(f'{os.getcwd()}/src/oxford_mgnify/schemas/MGnifyAnalysisDetail.json', 'r') as file:
        analysis_detail_schema = file.read()
    with open(f'{os.getcwd()}/src/oxford_mgnify/schemas/PagedMGnifyAnalysis.json', 'r') as file:
        paged_analysis_schema = file.read()
    with open(f'{os.getcwd()}/src/oxford_mgnify/schemas/MGnifyStudyDetail.json', 'r') as file:
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
        "This endpoint gets the detail of a single study. The response from this endpoint has the following schema:\n"
        f"{study_detail_schema}\n\n"
        f"{get_biomes(query)}\n"
    )
    print(get_biomes(query))
    return context

#Constructs the final prompt, sends the request to the llm and processes the response
def get_script(query):
    prompt = f"{initial_prompt}\n{guidelines}\nContext:\n{get_context(query)}\n\nQuestion:\n{query}"

    response = openai_client.chat.completions.create(
        model="o4-mini",
        messages=[
            {"role": "user", "content": prompt}
        ],
        store=False
    )

    with open(f"{os.getcwd()}/src/oxford_mgnify/response.py", "w") as file:
        file.write(response.choices[0].message.content)
    
    return response.choices[0].message.content
#sends input query to deepseek, with low variability in output
def query_deepseek(query):
    prompt = f"{initial_prompt}\n{guidelines}\nContext:\n{get_context(query)}\n\nQuestion:\n{query}"
    api_url = "https://api.deepseek.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {DS_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "deepseek-reasoner",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0
    }
    response_obj = requests.post(api_url, json=payload, headers=headers)
    response = response_obj.json()["choices"][0]["message"]["content"]
    print(response)
    
    with open(f"{os.getcwd()}/src/oxford_mgnify/response.py", "w") as file:
            file.write(response)
    if response_obj.status_code == 200:
        return response
    else:
        return f"Error: {response_obj.status_code}, {response_obj.text}"
    
def main():
    #Example query: Retrieve the analysis run with accession MGYA01000004
    query = input()
    query_deepseek(query)
    # print(get_biomes(query))

if __name__ == "__main__":
    main()