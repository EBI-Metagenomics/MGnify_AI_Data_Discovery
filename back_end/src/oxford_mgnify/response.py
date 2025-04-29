import requests
import json
import sys

def get_mgnify_analysis_detail(accession):
    url = f"https://www.ebi.ac.uk/metagenomics/api/v2/analyses/{accession}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    accession = "MGYA01000004"
    analysis_detail = get_mgnify_analysis_detail(accession)
    print(json.dumps(analysis_detail, indent=2))

if __name__ == "__main__":
    main()