import openai
import chromadb
import os

with open("back_end/src/oxford_mgnify/biomes.txt") as file:
    lineages = file.read().splitlines()

API_KEY = os.environ["OPENAI_API_KEY"]
openai_client = openai.OpenAI(api_key=API_KEY)

def embed(texts):
    response = openai_client.embeddings.create(input=texts, model="text-embedding-3-small")
    return [e.embedding for e in response.data]

chroma_client = chromadb.PersistentClient(path=f'{os.getcwd()}/back_end/src/oxford_mgnify/')
collection = chroma_client.get_or_create_collection(name="lineages")

embeddings = embed(lineages)

collection.add(
    documents=lineages,
    embeddings=embeddings,
    ids=[f"id_{i}" for i in range(len(lineages))]
)