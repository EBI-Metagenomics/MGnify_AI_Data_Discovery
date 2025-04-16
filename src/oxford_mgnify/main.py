import yaml
from pathlib import Path
from additional_functions.prune_endpoints import select_endpoints_llm
from api.receiver import call_endpoint
import torch

def load_registry(registry_path: Path) -> dict:
    """Load the YAML registry from the given path."""
    with registry_path.open("r") as file:
        data = yaml.safe_load(file)
    return data

def display_candidates(candidates):
    """Print out candidate endpoint selections."""
    if not candidates:
        print("Model did not return any candidate endpoints.")
        return
    print("Model recommends the following endpoint selection(s):")
    for idx, ep in enumerate(candidates, start=1):
        name = ep.get('name', 'unknown')
        params = ep.get('params', {})
        print(f"{idx}. Name: {name} with params: {params}")
    print()

def main():
    # Set device to GPU if available, otherwise CPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Locate the registry file from the data folder.
    BASE_DIR = Path(__file__).parent
    registry_file = BASE_DIR / "data" / "ebi_registry.yaml"
    registry = load_registry(registry_file)
    
    user_query = input("Enter your query: ")
    
    # Use the local model to select endpoints based on the natural language query.
    llm_candidates = select_endpoints_llm(user_query, registry)
    display_candidates(llm_candidates)

    if not llm_candidates:
        print("No endpoints returned by the model. Exiting.")
        return

    # For simplicity, use the first returned candidate.
    selected_endpoint_name = llm_candidates[0].get('name')
    params = llm_candidates[0].get('params', {})

    # Find the selected endpoint in the registry.
    candidate = None
    for ep in registry.get("endpoints", []):
        if ep.get("name") == selected_endpoint_name:
            candidate = ep
            break

    if candidate is None:
        print(f"Endpoint '{selected_endpoint_name}' not found in registry.")
        return

    print(f"Calling endpoint '{selected_endpoint_name}' at URL: {candidate.get('url')}")
    
    # Optionally, if parameters need substitution, you can modify candidate['url'] here.
    # For example, if candidate['url'] is "api/v2/resource/<id>", you can replace <id> with params.get('id')
    # For simplicity, we assume no parameter substitution is required.
    
    response_text = call_endpoint(candidate)
    print("\nResponse from the API endpoint:")
    print(response_text)

if __name__ == "__main__":
    main()
