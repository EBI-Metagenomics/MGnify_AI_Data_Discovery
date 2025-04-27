import requests
import json
import sys

def get_analysis(accession):
    url = f"https://www.ebi.ac.uk/metagenomics/api/v2/analyses/{accession}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        required_keys = ["study_accession", "accession", "experiment_type"]
        if not all(key in data for key in required_keys):
            print("INVALID REQUEST")
            sys.exit(1)
        print(json.dumps(data))
    except requests.exceptions.RequestException:
        print("INVALID REQUEST")
    except json.JSONDecodeError:
        print("INVALID REQUEST")

if __name__ == "__main__":
    get_analysis("MGYA01000004")