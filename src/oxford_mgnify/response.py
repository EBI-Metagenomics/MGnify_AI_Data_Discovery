import requests
import json
from datetime import datetime

# Define current year
current_year = datetime.now().year

# Define Base URL
base_url = "https://www.ebi.ac.uk/metagenomics/api/v2/analyses/"

# Initialize a list to store analyses
analyses_results = []

# Iterate over pages of results
page = 1
while True:
    # Get response from API
    response = requests.get(f'{base_url}?page={page}')
    data = response.json()
    
    # Check the 'updated_at' field of each analysis 
    for item in data['items']:
        if 'updated_at' in item['sample'] and item['sample']['updated_at'] is not None:
            updated_year = int(item['sample']['updated_at'].split('-')[0])
            if updated_year == current_year:
                analyses_results.append(item)

    # Check if there are more pages
    if data.get('links', {}).get('next', None) is None:
        break
    else:
        page += 1

print(json.dumps(analyses_results))