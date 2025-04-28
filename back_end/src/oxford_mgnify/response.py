import requests
import json
import sys

def main():
    accession = "MGYA01000004"
    url = f"https://www.ebi.ac.uk/metagenomics/api/v2/analyses/{accession}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        print(json.dumps(data))
    except requests.exceptions.RequestException:
        sys.exit(1)
    except json.JSONDecodeError:
        sys.exit(1)

if __name__ == "__main__":
    main()