import requests
import json
import sys

def main():
    url = "https://www.ebi.ac.uk/metagenomics/api/v2/analyses/MGYA01000004"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        json.dump(data, sys.stdout)
    except requests.exceptions.RequestException as e:
        sys.stderr.write(f"Request failed: {e}\n")
        sys.exit(1)
    except ValueError as e:
        sys.stderr.write(f"Invalid JSON response: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
