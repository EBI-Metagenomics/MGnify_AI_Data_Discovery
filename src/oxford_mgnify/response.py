import requests
import json

endpoint = "https://www.ebi.ac.uk/metagenomics/api/v2/studies"

response = requests.get(endpoint)
studies_data = response.json()

print(json.dumps(studies_data))