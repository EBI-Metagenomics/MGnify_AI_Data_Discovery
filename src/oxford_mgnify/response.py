import requests
import json

def get_analysis_details(analysis_accession):
    base_url = "https://www.ebi.ac.uk/metagenomics/api/v2/analyses/"
    url = base_url + analysis_accession
    # send a GET request and store the response as a JSON object
    response = requests.get(url)
    analysis_info = response.json()
    if "downloads" in analysis_info:
        taxonomic_info = [file for file in analysis_info['downloads'] if file['download_type'] == 'Taxonomic analysis']
        return taxonomic_info
    else:
        return "No taxonomic information available for this analysis."

# example use:
analysis = 'MGYA01000004'
print(json.dumps(get_analysis_details(analysis))) 