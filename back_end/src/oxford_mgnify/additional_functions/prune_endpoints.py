import json
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

def select_endpoints_llm(query: str, registry: dict) -> list:
    model_name = "facebook/opt-350m"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)

    # Move model to GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    endpoints = registry.get("endpoints", [])
    registry_summary = "\n".join(
        [
            f"- {ep.get('name')}: URL='{ep.get('url')}' Description='{ep.get('description')}'"
            for ep in endpoints
        ]
    )

    prompt = f"""
                You are an API agent that helps decide which endpoints to call based on user queries.
                Below is a registry of available API endpoints:
                {registry_summary}

                User query: "{query}"

                Return a JSON list of endpoint selections. Each selection should be a JSON object with:
                - "name": the endpoint name (as it appears in the registry)
                - "params": a dictionary of parameters if the endpoint requires substitution (if none, leave empty)

                Only return valid JSON. Do not include any additional text.
            """
    
    try:
        # Tokenize the input with proper attention mask
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True,
            return_attention_mask=True
        )
        inputs = inputs.to(device)
        
        # Generate response with proper max_new_tokens
        with torch.no_grad():
            outputs = model.generate(
                input_ids=inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_new_tokens=150,  # Changed from max_length to max_new_tokens
                num_return_sequences=1,
                temperature=0.2,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode the response
        raw_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract the JSON part from the response
        start_idx = raw_text.find('[')
        end_idx = raw_text.rfind(']') + 1
        if start_idx != -1 and end_idx != 0:
            json_str = raw_text[start_idx:end_idx]
            candidate_endpoints = json.loads(json_str)
        else:
            print("Failed to find JSON in the model's response")
            print("Raw response:", raw_text)  # Added for debugging
            candidate_endpoints = []
            
    except Exception as e:
        print(f"Error calling the model: {e}")
        return []
    
    return candidate_endpoints