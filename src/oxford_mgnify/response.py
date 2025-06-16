import requests
from datetime import datetime

try:
    # Define the API endpoint
    api_endpoint = "https://www.ebi.ac.uk/metagenomics/api/v2/analyses/"
    
    # Make an API request and get the data in JSON format
    response = requests.get(api_endpoint).json()

    # Get the current year
    current_year = datetime.now().year
    
    # Filter analyses from this year
    analyses_from_this_year = []
    for item in response['items']:
        # Check if 'sample' is not None
        if item.get('sample'):
            # Extract the year from the 'updated_at' date
            updated_year = datetime.strptime(item['sample']['updated_at'], "%Y-%m-%dT%H:%M:%S.%fZ").year
            if updated_year == current_year:
                analyses_from_this_year.append(item)

    result = {"items": analyses_from_this_year, "count": len(analyses_from_this_year)}

    print(result)
except Exception as e:
    print(f"An error occurred: {e}")