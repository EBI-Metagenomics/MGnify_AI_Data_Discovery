import requests
import json
from datetime import datetime, timedelta

def fetch_data_from_query(url):
    response = requests.get(url)
    return json.loads(response.text)

data = fetch_data_from_query('https://www.ebi.ac.uk/metagenomics/api/v2/analyses')

last_year = datetime.now() - timedelta(days=365)
analysis_from_last_year = []

for item in data['items']:
    if 'sample' in item.keys():
        sample = item['sample']
        if sample is not None and 'updated_at' in sample.keys():
            updated_at = sample['updated_at']
            updated_date = datetime.strptime(updated_at, '%Y-%m-%dT%H:%M:%S.%fZ')
            if updated_date > last_year:
                analysis_from_last_year.append(item)

print(json.dumps(analysis_from_last_year))