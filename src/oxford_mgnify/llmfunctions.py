import requests
def query_deepseek(query):#sends input query to deepseek, with low variability in output
    api_key = "APIkey"
    api_url = "https://api.deepseek.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": query}],
        "temperature": 0
    }
    response = requests.post(api_url, json=payload, headers=headers)

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.status_code}, {response.text}"
    
#composes an API end point from a tuple of the form (api_number, param1, param2 ....)    
def produce_endpoint(parameters):
    n = int(parameters[0])
    match n:
        case 1:
            return f"/api/v2/studies/{parameters[1]}"
        case 2:
            return "/api/v2/studies"
        case 3:
            return "/api/v2/my-data/studies"
        case 4:
            return f"/api/v2/analyses/{parameters[1]}"
        case 5:
            return f"/api/v2/analyses/{parameters[1]}/annotations",
        case 6:
            return f"/api/v2/analyses/{parameters[1]}/annotations/{parameters[2]}"
        case 7:
            return f"/api/v2/analyses"
        case 8:
            return f"/api/v2/my-data/analyses"
        case 9:    
            return f"/api/v2/analysis_requests"
        case 10:
            return f"/api/v2/analysis_requests"
        case 11: 
            return f"/api/v2/analysis_requests/{parameters[1]}"
        case _:
            raise ReferenceError
        
    #turns the output from the AI (which is in the form "3 param1 param2 | 1 param 1 ...") into api endpoints
def parse(input):
    unrefined_apis = input.split("|")
    refined_apis = []
    for api in unrefined_apis:
        temp = api.strip()
        temp = temp.split(" ")
        refined_apis.append(produce_endpoint(tuple(temp)))
    
    return refined_apis
    
    
def text_to_api(user_query):
    #TODO:ask which apis should be used
    text_to_api_query = f"""Query:
    I have a list of 11 APIs, each with a specific function. Based on the user input below, return a number (or multiple numbers) from 1 to 11, corresponding to the most relevant APIs to use.
    
    - Each API call should be represented as API_Number param1_value param2_value ... |

    - Separate multiple API calls with |

    - Do not return any explanations, just the formatted string.

    User Input: {user_query}

    API List:
    1. /api/v2/studies/{{accession}} – Get the detail of a single study analysed by MGnify. [required param: accession]

    2. /api/v2/studies – List all studies analysed by MGnify. [required params: none]

    3. /api/v2/my-data/studies – List all private studies available from MGnify. [required params: none]

    4. /api/v2/analyses/{{accession}} – Get MGnify analysis by accession. [required param: accession]

    5. /api/v2/analyses/{{accession}}/annotations – Get MGnify analysis by accession with annotations and downloadable files. [required param: accession]

    6. /api/v2/analyses/{{accession}}/annotations/{{annotation_type}} – Get Mgnify Analysis With Annotations Of Type. [required params: accession, annotation_type]

    7. /api/v2/analyses – List all analyses (MGYAs) available from MGnify. [required params: none]

    8. /api/v2/my-data/analyses – List all private analyses (MGYAs) available from MGnify. [required params: none]

    9. /api/v2/analysis_requests – List Assembly Analysis Requests. [required params: none]

    10. /api/v2/analysis_requests – Create Assembly Analysis Request. [required params: request body parameters as defined in the API schema]

    11. /api/v2/analysis_requests/{{analysis_request_id}} – Get Assembly Analysis Request. [required param: analysis_request_id]"""

    api_string = query_deepseek(text_to_api_query)
    print("Deepseek says: "+api_string)
   
    #TODO:assemble apis
    endpoints = parse(api_string)
    print("API endpoints are:"+str(endpoints))
    return endpoints
