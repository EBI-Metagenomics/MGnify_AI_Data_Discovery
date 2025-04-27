import requests
import json

def main():
    url = "https://www.ebi.ac.uk/metagenomics/api/v2/analyses/MGYA01000004"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print(json.dumps(data))
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()