import requests
import json

def get_analysis_detail(analysis_accession):
    response = requests.get(f'https://www.ebi.ac.uk/metagenomics/api/v2/analyses/{analysis_accession}')
    if response.status_code == 200:
        return response.json()
    else:
        return None

analysis_detail = get_analysis_detail('MGYA03000000004')
if analysis_detail is not None:
    print(json.dumps(analysis_detail))
else:
    print('Failed to retrieve analysis detail')