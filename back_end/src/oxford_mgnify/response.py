import requests
import json
import sys

API_BASE = "https://www.ebi.ac.uk/metagenomics/api/v2"

def get_soil_studies():
    soil_studies = set()
    page = 1
    page_size = 100
    while True:
        try:
            response = requests.get(f"{API_BASE}/analyses/", params={"page": page, "page_size": page_size})
            response.raise_for_status()
            data = response.json()
            for analysis in data.get("items", []):
                study_accession = analysis.get("study_accession")
                if study_accession and study_accession not in soil_studies:
                    study_response = requests.get(f"{API_BASE}/studies/{study_accession}")
                    study_response.raise_for_status()
                    study_data = study_response.json()
                    biome = study_data.get("biome")
                    if biome and biome.get("biome_name") == "Soil":
                        soil_studies.add(study_accession)
            if page * page_size >= data.get("count", 0):
                break
            page += 1
        except Exception:
            print("INVALID REQUEST")
            sys.exit()
    return soil_studies

def get_analysis_details(soil_studies):
    analysis_details = []
    page = 1
    page_size = 100
    while True:
        try:
            response = requests.get(f"{API_BASE}/analyses/", params={"page": page, "page_size": page_size})
            response.raise_for_status()
            data = response.json()
            for analysis in data.get("items", []):
                study_accession = analysis.get("study_accession")
                if study_accession in soil_studies:
                    accession = analysis.get("accession")
                    if accession:
                        detail_response = requests.get(f"{API_BASE}/analyses/{accession}")
                        detail_response.raise_for_status()
                        detail_data = detail_response.json()
                        analysis_details.append(detail_data)
            if page * page_size >= data.get("count", 0):
                break
            page += 1
        except Exception:
            print("INVALID REQUEST")
            sys.exit()
    return analysis_details

def main():
    try:
        soil_studies = get_soil_studies()
        analysis_details = get_analysis_details(soil_studies)
        print(json.dumps({"analyses": analysis_details}, indent=2))
    except Exception:
        print("INVALID REQUEST")

if __name__ == "__main__":
    main()