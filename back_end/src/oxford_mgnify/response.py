import requests
import json
import sys

def main():
    base_url = "https://www.ebi.ac.uk/metagenomics/api/v2/analyses"
    analysis_accession = "MGYA01000004"
    url = f"{base_url}/{analysis_accession}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching analysis: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"Invalid JSON response: {e}", file=sys.stderr)
        sys.exit(1)

    # Validate required keys for MGnifyAnalysisDetail
    required_keys = {"study_accession", "accession", "experiment_type"}
    if not isinstance(data, dict) or not required_keys.issubset(data.keys()):
        print("INVALID REQUEST")
        sys.exit(0)

    print(json.dumps(data))

if __name__ == "__main__":
    main()