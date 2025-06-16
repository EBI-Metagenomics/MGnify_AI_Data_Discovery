import requests
from datetime import datetime

def get_analysis_from_this_year():
    current_year = datetime.now().year
    all_analyses = []

    url = "https://www.ebi.ac.uk/metagenomics/api/v2/analyses/"
    while url:
        response = requests.get(url)
        data = response.json()
        all_analyses.extend(data["items"])
        url = data.get("next")    

    analyses_from_this_year = [analysis for analysis in all_analyses if datetime.strptime(analysis['sample']['updated_at'], "%Y-%m-%dT%H:%M:%S.%fZ").year == current_year]
    latest_analysis_this_year = max(analyses_from_this_year, key=lambda x: x['sample']['updated_at'])

    return latest_analysis_this_year

print(get_analysis_from_this_year())