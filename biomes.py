import requests
base_endpoint = "https://www.ebi.ac.uk/metagenomics/api/"
biome_endpoint = base_endpoint + "biomes"
def children_endpoint(lineage): f"{base_endpoint}/{lineage}/children"
queue = []