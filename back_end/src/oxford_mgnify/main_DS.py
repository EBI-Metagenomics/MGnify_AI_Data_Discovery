import os
import requests
from openai import OpenAI
import chromadb
import traceback
import json
import logging
import logging.handlers
import sys
from datetime import datetime

# Configure logging
log_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(log_directory, exist_ok=True)
log_file = os.path.join(log_directory, 'main_ds.log')

# Create a logger
logger = logging.getLogger('oxford_mgnify_deepseek')
logger.setLevel(logging.DEBUG)

# Create handlers
file_handler = logging.handlers.RotatingFileHandler(
    log_file, maxBytes=10485760, backupCount=5)  # 10MB per file, keep 5 backups
console_handler = logging.StreamHandler()

# Create formatters and add it to handlers
log_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(log_format)
console_handler.setFormatter(log_format)

# Add handlers to the logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

logger.info("Initializing Oxford MGnify DeepSeek module")

# Safely get API keys from environment variables
try:
    logger.info("Retrieving API keys from environment variables")

    API_KEY = os.environ['OPENAI_API_KEY']
    if not API_KEY:
        logger.error("OpenAI API key is empty")
        raise ValueError("OpenAI API key is empty. Please set a valid OPENAI_API_KEY environment variable.")
    logger.debug("OpenAI API key retrieved successfully")

    DS_API_KEY = os.environ['DEEPSEEK_API_KEY']
    if not DS_API_KEY:
        logger.error("DeepSeek API key is empty")
        raise ValueError("DeepSeek API key is empty. Please set a valid DEEPSEEK_API_KEY environment variable.")
    logger.debug("DeepSeek API key retrieved successfully")

    openai_client = OpenAI(api_key=API_KEY)
    logger.info("API clients initialized successfully")

except KeyError as e:
    missing_key = str(e).strip("'")
    logger.error(f"{missing_key} environment variable not found", exc_info=True)
    raise ValueError(f"{missing_key} environment variable not found. Please set this environment variable.")

initial_prompt = """
You are an expert in the EBI MGnify V2 API.
Please help to generate a python script to answer the question. Your response should be based on the given context and follow the response guidelines and format instructions.
"""

guidelines = """
1. If the provided context is sufficient, please generate a valid python script without any explanations of the question or the script.
2. Do not hallucinate or make assumptions about the API. If the context is not sufficient, please respond with "INSUFFICIENT CONTEXT".
3. The result of the python script must be a JSON object containing MGnifyAnalysisDetail objects or MGnifyStudyDetail objects, depending on the query. If the result would not be of this form please respond with "INVALID REQUEST".
4. The script should be a complete and valid Python script that can be run as is - do not include any markdown or code fences.
5. The script should include necessary import statements and handle any potential exceptions.
6. Do not include anything other than the script in your response.
7. Use the API documentation provided in the context to understand the API endpoints, parameters, and response formats.
8. Use only the context provided, details from the query about the API or any biomes should not be used in your response.
9. For time-based queries like "Show me all studies published in 2023", use the updated_at field to filter by date.
10. For queries about specific studies like "Show me all analyses for study MGYS00001234", use the study_accession field to filter analyses.
11. For natural language queries, extract the key entities and parameters (like dates, study accessions, biomes) and use them to construct appropriate API calls.
12. When printing the final result, use json.dumps() to ensure the output is valid JSON format. For example: print(json.dumps(result))
"""

def get_biomes(query):
    """
    Get relevant biome lineages for the query using embeddings.

    Args:
        query (str): The user's query

    Returns:
        str: Formatted biome information
    """
    logger.info(f"Getting biomes for query: {query}")

    try:
        logger.debug("Initializing ChromaDB client")
        chroma_client = chromadb.PersistentClient(path=f'{os.getcwd()}/src/oxford_mgnify/chromadb')
        logger.debug("Getting lineages collection")
        collection = chroma_client.get_collection(name="lineages")

        logger.debug("Creating embedding for query using text-embedding-3-small model")
        query_embedding = openai_client.embeddings.create(input=query, model="text-embedding-3-small").data[0].embedding
        logger.debug("Querying collection with embedding")
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=10
        )

        logger.debug(f"Retrieved {len(results['documents'][0])} biome lineages")

        biomes = (
            "The biome referenced by a lineage is the final item in the lineage, where items are split by ':' \n"
            "Any individual item in the lineage is also a valid biome\n"
            "If the query references information that does not reference the biome, it may be found in the title field of the study\n"
            "Here are some lineages for biomes which may be relevant.\n"
        )

        for lineage in results['documents'][0]:
            biomes += f'{lineage}\n'

        logger.info("Biome information generated successfully")
        return biomes

    except Exception as e:
        logger.error(f"Error retrieving biomes: {str(e)}", exc_info=True)
        # Return a fallback message in case of error
        return "Error retrieving biome information. Please try again later."



def get_context(query):
    """
    Get context information for the query, including API schemas and relevant biomes.

    Args:
        query (str): The user's query

    Returns:
        str: Context information for the LLM

    Raises:
        FileNotFoundError: If schema files cannot be found
        IOError: If there's an error reading schema files
    """
    logger.info(f"Getting context for query: {query}")

    try:
        # Load schema files
        schema_base_path = f'{os.getcwd()}/src/oxford_mgnify/schemas'
        logger.debug(f"Loading schema files from: {schema_base_path}")

        try:
            logger.debug("Loading MGnifyAnalysisDetail.json")
            with open(f'{schema_base_path}/MGnifyAnalysisDetail.json', 'r') as file:
                analysis_detail_schema = file.read()
                logger.debug("Successfully loaded MGnifyAnalysisDetail.json")
        except FileNotFoundError as e:
            logger.error(f"Failed to load MGnifyAnalysisDetail.json: {str(e)}", exc_info=True)
            raise

        try:
            logger.debug("Loading PagedMGnifyAnalysis.json")
            with open(f'{schema_base_path}/PagedMGnifyAnalysis.json', 'r') as file:
                paged_analysis_schema = file.read()
                logger.debug("Successfully loaded PagedMGnifyAnalysis.json")
        except FileNotFoundError as e:
            logger.error(f"Failed to load PagedMGnifyAnalysis.json: {str(e)}", exc_info=True)
            raise

        try:
            logger.debug("Loading MGnifyStudyDetail.json")
            with open(f'{schema_base_path}/MGnifyStudyDetail.json', 'r') as file:
                study_detail_schema = file.read()
                logger.debug("Successfully loaded MGnifyStudyDetail.json")
        except FileNotFoundError as e:
            logger.error(f"Failed to load MGnifyStudyDetail.json: {str(e)}", exc_info=True)
            raise

        # Get biomes information
        logger.debug("Getting biomes information")
        biomes_info = get_biomes(query)
        logger.debug("Successfully retrieved biomes information")

        # Construct context
        logger.debug("Constructing context with schema and biome information")
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
            f"{biomes_info}\n"
        )

        logger.info("Context generation completed successfully")
        return context

    except FileNotFoundError as e:
        error_msg = f"Schema file not found: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise FileNotFoundError(error_msg)
    except IOError as e:
        error_msg = f"Error reading schema file: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise IOError(error_msg)
    except Exception as e:
        error_msg = f"Unexpected error generating context: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise Exception(error_msg)

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
    """
    Generate a Python script to answer the user's query using DeepSeek API.

    Args:
        query (str): The user's query

    Returns:
        str: Generated Python script

    Raises:
        ValueError: If the query is empty or invalid
        ConnectionError: If there's an error connecting to the DeepSeek API
        Exception: For other errors during script generation
    """
    logger.info(f"Generating script with DeepSeek for query: {query}")

    if not query or not isinstance(query, str):
        logger.error("Invalid query: empty or not a string")
        raise ValueError("Query must be a non-empty string")

    try:
        # Get context for the query
        logger.debug("Getting context for the query")
        context = get_context(query)
        logger.debug("Context retrieved successfully")

        # Construct the prompt
        logger.debug("Constructing prompt with context")
        prompt = f"{initial_prompt}\n{guidelines}\nContext:\n{context}\n\nQuestion:\n{query}"
        logger.debug(f"Prompt constructed (length: {len(prompt)} characters)")

        api_url = "https://api.deepseek.com/v1/chat/completions"
        logger.debug(f"Using DeepSeek API URL: {api_url}")

        headers = {
            "Authorization": f"Bearer {DS_API_KEY}",
            "Content-Type": "application/json"
        }
        logger.debug("API headers prepared")

        payload = {
            "model": "deepseek-reasoner",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0
        }
        logger.debug("API payload prepared with model: deepseek-reasoner, temperature: 0")

        try:
            # Call DeepSeek API
            logger.info("Sending request to DeepSeek API")
            response_obj = requests.post(api_url, json=payload, headers=headers, timeout=60)
            logger.info(f"Received response from DeepSeek API with status code: {response_obj.status_code}")

            # Check for HTTP errors
            if response_obj.status_code != 200:
                error_msg = f"DeepSeek API returned error status code {response_obj.status_code}: {response_obj.text}"
                logger.error(error_msg)
                raise ConnectionError(error_msg)

            # Parse the response
            try:
                logger.debug("Parsing JSON response from DeepSeek API")
                response_json = response_obj.json()

                # Validate response structure
                if "choices" not in response_json or len(response_json["choices"]) == 0:
                    logger.error("Invalid response format: missing 'choices'")
                    raise ValueError("Invalid response format from DeepSeek API: missing 'choices'")

                if "message" not in response_json["choices"][0]:
                    logger.error("Invalid response format: missing 'message'")
                    raise ValueError("Invalid response format from DeepSeek API: missing 'message'")

                if "content" not in response_json["choices"][0]["message"]:
                    logger.error("Invalid response format: missing 'content'")
                    raise ValueError("Invalid response format from DeepSeek API: missing 'content'")

                generated_script = response_json["choices"][0]["message"]["content"]
                script_lines = generated_script.count('\n') + 1
                logger.info(f"Successfully generated script with {script_lines} lines")

                # Log a preview of the script (first 3 lines)
                preview_lines = generated_script.split('\n')[:3]
                preview = '\n'.join(preview_lines)
                logger.debug(f"Script preview:\n{preview}...")

                # Save the script to a file
                try:
                    response_file_path = os.path.join(os.getcwd(), "src", "oxford_mgnify", "response.py")
                    logger.debug(f"Saving generated script to {response_file_path}")
                    with open(response_file_path, "w") as file:
                        file.write(generated_script)
                    logger.info("Script saved successfully")
                except IOError as e:
                    logger.warning(f"Could not save generated script to file: {str(e)}", exc_info=True)
                    # Continue even if saving fails

                return generated_script

            except json.JSONDecodeError as e:
                error_msg = f"Error parsing DeepSeek API response: {str(e)}"
                logger.error(error_msg, exc_info=True)
                raise ValueError(error_msg)

        except requests.exceptions.RequestException as e:
            error_msg = f"Error connecting to DeepSeek API: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise ConnectionError(error_msg)

    except Exception as e:
        error_msg = f"Error generating script with DeepSeek: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise Exception(error_msg)

def main():
    """
    Main function to handle user queries and generate scripts using DeepSeek.

    Reads a query from standard input and generates a script to answer it.
    """
    logger.info("Starting main function")
    try:
        logger.info("Waiting for user input...")
        query = input("Enter your query: ")
        logger.info(f"Received query: {query}")

        if not query:
            logger.warning("Empty query received")
            print("Query cannot be empty. Please try again.")
            return

        logger.info("Generating script with DeepSeek for the query")
        script = query_deepseek(query)
        logger.info("Script generation completed")

        print("\nGenerated script:")
        print("-" * 40)
        print(script)
        print("-" * 40)

    except KeyboardInterrupt:
        logger.info("Process interrupted by user")
        print("\nProcess interrupted by user.")
    except Exception as e:
        logger.error(f"Unexpected error in main function: {str(e)}", exc_info=True)
        print(f"Error: {str(e)}")

    logger.info("Main function completed")

if __name__ == "__main__":
    try:
        logger.info("Starting DeepSeek application")
        main()
        logger.info("Application completed successfully")
    except Exception as e:
        logger.critical(f"Unhandled exception in application: {str(e)}", exc_info=True)
        print(f"Critical error: {str(e)}")
        sys.exit(1)
