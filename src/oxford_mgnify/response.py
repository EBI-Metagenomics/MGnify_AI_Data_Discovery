import requests
import json

response = requests.get('https://www.ebi.ac.uk/metagenomics/api/v2/studies/')
data = json.loads(response.text)

print(data)