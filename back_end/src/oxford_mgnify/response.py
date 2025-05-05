import requests
import json
import sys

def fetch_analysis(accession):
    url = f"https://www.ebi.ac.uk/metagenomics/api/v2/analyses/{accession}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        # Ensure the response conforms to MGnifyAnalysisDetail (must have required keys)
        required_keys = {"study_accession", "accession", "experiment_type"}
        if not required_keys.issubset(data.keys()):
            print("INVALID REQUEST", file=sys.stderr)
            sys.exit(1)
        print(json.dumps(data))
    except requests.exceptions.RequestException as e:
        print(f"Error fetching analysis: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError:
        print("Error parsing JSON response", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    fetch_analysis("MGYA01000004")