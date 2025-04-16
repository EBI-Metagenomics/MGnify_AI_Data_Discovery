import requests

BASE_API_URL = "http://localhost:8000/"
REGISTRY_URL = BASE_API_URL + "api/endpoint-registry"
CATALOG_FILE = "ebi_registry.yaml"

def call_endpoint(endpoint: dict) -> str:
    """
    Given an endpoint dictionary (with a relative 'url'), construct a full URL
    and perform a GET request. Return the response text.
    """
    # Get the relative URL from the endpoint data.
    relative_url = endpoint.get("url", "").lstrip("/")
    full_url = BASE_API_URL + relative_url

    try:
        response = requests.get(full_url)
        response.raise_for_status()
        return response.text
    except Exception as e:
        return f"Error calling endpoint at {full_url}: {e}"

def update_endpoint_catalog():
    try:
        response = requests.get(REGISTRY_URL)
        if response.status_code == 200:
            with open(CATALOG_FILE, "w") as file:
                file.write(response.text)
            print(f"Endpoint catalog updated successfully in '{CATALOG_FILE}'.")
        else:
            print(f"Failed to retrieve endpoint registry. HTTP status code: {response.status_code}")
    except Exception as e:
        print(f"An exception occured: {e}")


# only to be used when debugging. Not meant to be run as a standalone script.
if __name__ == "__main__":
    update_endpoint_catalog()