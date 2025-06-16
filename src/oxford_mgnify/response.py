import requests
import json
from datetime import datetime

# Define the base URL for the API
base_url = "https://www.ebi.ac.uk/metagenomics/api/v2/analyses/"

# Get the current year
current_year = datetime.now().year

# Send a GET request
response = requests.get(base_url)

# Raise an exception if the request was unsuccessful
if response.status_code != 200:
    raise Exception("GET request to {} returned status code {}".format(base_url, response.status_code))

# Load the response into a JSON object
ans = response.json()

# Filter analyses from the current year
ans_current_year = [item for item in ans["items"] if datetime.fromisoformat(item["sample"]["updated_at"][:-1]).year == current_year]

# Print the analyses from the current year
print(json.dumps(ans_current_year))