import requests
import json
import sys

BASE_URL = "https://www.ebi.ac.uk/metagenomics/api/v2"

def fetch_json(url, params=None):
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        sys.exit(f"Error fetching {url}: {e}")

def is_soil_biome(biome):
    if not biome:
        return False
    name = biome.get("biome_name", "")
    if "Soil" in name:
        return True
    lineage = biome.get("lineage", "")
    parts = lineage.split(":") if lineage else []
    return any(part == "Soil" for part in parts)

def main():
    page = 1
    page_size = 100
    soil_analysis_details = []

    while True:
        analyses_page = fetch_json(f"{BASE_URL}/analyses", params={"page": page, "page_size": page_size})
        items = analyses_page.get("items", [])
        if not items:
            break
        for summary in items:
            study_acc = summary.get("study_accession")
            if not study_acc:
                continue
            study = fetch_json(f"{BASE_URL}/studies/{study_acc}")
            if is_soil_biome(study.get("biome")):
                acc = summary.get("accession")
                if acc:
                    detail = fetch_json(f"{BASE_URL}/analyses/{acc}")
                    soil_analysis_details.append(detail)
        page += 1

    output = {"analyses": soil_analysis_details}
    print(json.dumps(output))

if __name__ == "__main__":
    main()