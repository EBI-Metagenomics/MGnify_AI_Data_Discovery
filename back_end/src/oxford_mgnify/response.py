import requests
import json
import sys

def fetch_analysis(accession):
    url = f"https://www.ebi.ac.uk/metagenomics/api/v2/analyses/{accession}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def main():
    accession = "MGYA01000004"
    try:
        analysis_detail = fetch_analysis(accession)
    except requests.exceptions.RequestException as e:
        sys.stderr.write(f"Error fetching analysis: {e}\n")
        sys.exit(1)
    print(json.dumps(analysis_detail))

if __name__ == "__main__":
    main()