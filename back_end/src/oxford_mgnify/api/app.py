from flask import Flask, request, jsonify
# from ..main import get_script
# from ..main_DS import query_deepseek
from flask_cors import CORS
import io
import contextlib
import traceback
import os
import json
import sys
import logging
import logging.handlers
from datetime import datetime

from back_end.src.oxford_mgnify.main import get_script, openai_client
from back_end.src.oxford_mgnify.main_DS import query_deepseek

# Configure logging
log_directory = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
os.makedirs(log_directory, exist_ok=True)
log_file = os.path.join(log_directory, 'api.log')

# Create a logger
logger = logging.getLogger('oxford_mgnify_api')
logger.setLevel(logging.DEBUG)

# Create handlers
file_handler = logging.handlers.RotatingFileHandler(
    log_file, maxBytes=10485760, backupCount=5)  # 10MB per file, keep 5 backups
console_handler = logging.StreamHandler()

# Create formatters and add it to handlers
log_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(log_format)
console_handler.setFormatter(log_format)

# Add handlers to the logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

app = Flask(__name__)
frontend_port = os.environ.get("FRONTEND_PORT", "3001")
CORS(app, origins=[f"http://localhost:{frontend_port}"])

def create_error_response(error_type, message, details=None):
    """
    Create a standardized error response

    Args:
        error_type (str): Type of error (e.g., "ValidationError", "APIError")
        message (str): User-friendly error message
        details (dict, optional): Additional error details

    Returns:
        dict: Standardized error response
    """
    response = {
        "error": {
            "type": error_type,
            "message": message
        }
    }

    if details:
        response["error"]["details"] = details

    return response

def translate_query(query, source_lang="fr", target_lang="en"):
    """
    Translate a query from source language to target language using OpenAI API.

    Args:
        query (str): The query to translate
        source_lang (str): Source language code (default: "fr" for French)
        target_lang (str): Target language code (default: "en" for English)

    Returns:
        str: Translated query

    Raises:
        Exception: If translation fails
    """
    try:
        logger.info(f"Translating query from {source_lang} to {target_lang}: {query}")

        # Use OpenAI API for translation
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"You are a translator from {source_lang} to {target_lang}. Translate the following text, preserving all technical terms related to bioinformatics, genomics, and MGnify API. Provide only the translation without any explanations or additional text."},
                {"role": "user", "content": query}
            ],
            temperature=0.3
        )

        translated_query = response.choices[0].message.content.strip()
        logger.info(f"Translation result: {translated_query}")
        return translated_query

    except Exception as e:
        logger.error(f"Translation error: {str(e)}", exc_info=True)
        raise Exception(f"Failed to translate query: {str(e)}")

def extract_error_context(code, exception_info):
    """
    Extract the code context around the error line from the traceback.

    Args:
        code (str): The full code being executed
        exception_info (tuple): Exception info from sys.exc_info()

    Returns:
        dict: Dictionary containing error line, line number, and context
    """
    try:
        exc_type, exc_value, exc_traceback = exception_info

        # Get the traceback frame
        tb_frame = None
        tb = exc_traceback
        while tb:
            if tb.tb_frame.f_code.co_filename == "<dynamic>":
                tb_frame = tb
            tb = tb.tb_next

        if not tb_frame:
            tb_frame = exc_traceback

        # Get line number from the traceback
        line_number = tb_frame.tb_lineno

        # Split the code into lines
        code_lines = code.splitlines()

        # Calculate the context range (5 lines before and after the error)
        start_line = max(0, line_number - 6)
        end_line = min(len(code_lines), line_number + 5)

        # Extract the context lines with line numbers
        context_lines = []
        for i in range(start_line, end_line):
            line_num = i + 1  # Line numbers are 1-based
            prefix = ">> " if line_num == line_number else "   "
            context_lines.append(f"{prefix}{line_num}: {code_lines[i]}")

        # Get the error line
        error_line = code_lines[line_number - 1] if 0 <= line_number - 1 < len(code_lines) else ""

        return {
            "line_number": line_number,
            "error_line": error_line,
            "context": "\n".join(context_lines)
        }
    except Exception as e:
        logger.error(f"Error extracting code context: {str(e)}")
        return {
            "line_number": 0,
            "error_line": "",
            "context": "Could not extract code context"
        }

def run_dynamic(code: str, globals_dicts=None, locals_dicts=None):
    """
    Execute dynamically generated code and handle errors with detailed context.

    Args:
        code (str): The code to execute
        globals_dicts (dict, optional): Global variables dictionary
        locals_dicts (dict, optional): Local variables dictionary

    Returns:
        dict: Result of execution with success status and details
    """
    logger.info("Executing dynamically generated code")

    if globals_dicts is None:
        globals_dicts = {
            "__name__": "__main__",
            "__file__": "<dynamic>"
        }
    globals_dicts.setdefault('__builtins__', __builtins__)
    if locals_dicts is None:
        locals_dicts = globals_dicts

    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            compiled = compile(code, filename="<dynamic>", mode="exec")
            exec(compiled, globals_dicts)

        output = buf.getvalue()
        logger.info("Code executed successfully")
        return {"success": True, "globals": globals_dicts, "output": output}

    except SyntaxError as e:
        logger.error(f"Syntax error in generated code: {str(e)}")
        tb = traceback.format_exc()
        error_context = extract_error_context(code, sys.exc_info())
        error_message = f"Syntax error in generated code at line {error_context['line_number']}: {str(e)}"

        return {
            "success": False, 
            "error": error_message, 
            "error_type": "SyntaxError",
            "traceback": tb,
            "error_line": error_context["error_line"],
            "line_number": error_context["line_number"],
            "code_context": error_context["context"],
            "output": buf.getvalue()
        }

    except NameError as e:
        logger.error(f"Name error in generated code: {str(e)}")
        tb = traceback.format_exc()
        error_context = extract_error_context(code, sys.exc_info())
        error_message = f"Name error in generated code at line {error_context['line_number']}: {str(e)}"

        return {
            "success": False, 
            "error": error_message, 
            "error_type": "NameError",
            "traceback": tb,
            "error_line": error_context["error_line"],
            "line_number": error_context["line_number"],
            "code_context": error_context["context"],
            "output": buf.getvalue()
        }

    except Exception as e:
        logger.error(f"Error executing generated code: {str(e)}")
        tb = traceback.format_exc()
        error_context = extract_error_context(code, sys.exc_info())
        error_message = f"Error executing generated code at line {error_context['line_number']}: {str(e)}"

        return {
            "success": False, 
            "error": error_message, 
            "error_type": "ExecutionError",
            "traceback": tb,
            "error_line": error_context["error_line"],
            "line_number": error_context["line_number"],
            "code_context": error_context["context"],
            "output": buf.getvalue()
        }

@app.route("/code", methods=['POST'])
def returnCode():
    """
    Handle code generation and execution requests.

    Processes requests to generate and execute code based on natural language queries.
    Handles various error cases and returns detailed error information when needed.

    Returns:
        Response: JSON response with results or error details
    """
    logger.info("Received code generation request")

    # Check if request has valid JSON content type
    if not request.is_json:
        logger.warning("Invalid content type in request")
        error_response = create_error_response(
            "ValidationError", 
            "Invalid Content Type. Request must be JSON.",
            {"expected": "application/json"}
        )
        return jsonify(error_response), 400

    # Check if request body contains required fields
    request_body = request.json
    logger.info(f"Request body: {request_body}")

    if "model" not in request_body:
        logger.warning("Missing 'model' field in request")
        error_response = create_error_response(
            "ValidationError", 
            "Missing required field: model",
            {"required_fields": ["model", "query"]}
        )
        return jsonify(error_response), 400

    if "query" not in request_body:
        logger.warning("Missing 'query' field in request")
        error_response = create_error_response(
            "ValidationError", 
            "Missing required field: query",
            {"required_fields": ["model", "query"]}
        )
        return jsonify(error_response), 400

    # Get language parameter (default to 'en' if not provided)
    language = request_body.get("language", "en")
    logger.info(f"Query language: {language}")

    # Process request based on model
    try:
        model = request_body["model"]
        query = request_body["query"]
        logger.info(f"Processing request with model: {model}, query: {query}")

        # Translate query if language is not English
        original_query = query
        if language != "en":
            try:
                logger.info(f"Query is in {language}, translating to English")
                query = translate_query(query, source_lang=language, target_lang="en")
                logger.info(f"Translated query: {query}")
            except Exception as e:
                logger.error(f"Translation failed: {str(e)}", exc_info=True)
                error_response = create_error_response(
                    "TranslationError", 
                    f"Failed to translate query: {str(e)}",
                    {"original_query": original_query}
                )
                return jsonify(error_response), 500

        if model == "DeepSeek":
            try:
                logger.info("Generating code with DeepSeek model")
                code = query_deepseek(query)
                logger.info("Executing generated code")
                result = run_dynamic(code)
                logger.info("Code was run with DeepSeek!")
            except Exception as e:
                logger.error(f"Error calling DeepSeek API: {str(e)}", exc_info=True)
                error_response = create_error_response(
                    "DeepSeekAPIError", 
                    f"Error calling DeepSeek API: {str(e)}",
                    {"query": query, "traceback": traceback.format_exc()}
                )
                return jsonify(error_response), 500
        elif model == "ChatGPT":
            try:
                logger.info("Generating code with ChatGPT model")
                code = get_script(query)
                logger.info("Executing generated code")
                result = run_dynamic(code)
                logger.info("Code was run with ChatGPT!")
            except Exception as e:
                logger.error(f"Error calling OpenAI API: {str(e)}", exc_info=True)
                error_response = create_error_response(
                    "OpenAIAPIError", 
                    f"Error calling OpenAI API: {str(e)}",
                    {"query": query, "traceback": traceback.format_exc()}
                )
                return jsonify(error_response), 500
        else:
            logger.warning(f"Invalid model specified: {model}")
            error_response = create_error_response(
                "ValidationError", 
                f"Invalid model: {model}",
                {"valid_models": ["DeepSeek", "ChatGPT"]}
            )
            return jsonify(error_response), 400

        # Process result
        if result["success"]:
            try:
                logger.info("Code execution successful, parsing output")
                # Try to convert Python's string representation to valid JSON
                output = result["output"].strip()
                try:
                    # First attempt: try to parse as-is
                    parsed_output = json.loads(output)
                except json.JSONDecodeError:
                    logger.warning("Direct JSON parsing failed, attempting to fix output format")
                    try:
                        # Second attempt: try to evaluate as Python literal and convert to JSON
                        import ast
                        # Use ast.literal_eval to safely evaluate the string as a Python literal
                        python_obj = ast.literal_eval(output)
                        # Convert the Python object to a JSON string
                        output = json.dumps(python_obj)
                        parsed_output = json.loads(output)
                        logger.info("Successfully converted Python representation to JSON")
                    except (SyntaxError, ValueError, TypeError) as eval_error:
                        logger.error(f"Failed to convert output to JSON: {str(eval_error)}")
                        raise json.JSONDecodeError(f"Could not convert to valid JSON: {str(eval_error)}", output, 0)

                response = {
                    "accession": parsed_output,
                    "code": code
                }
                return jsonify(response), 200
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing JSON output: {str(e)}", exc_info=True)
                error_response = create_error_response(
                    "OutputFormatError", 
                    "Generated code produced invalid JSON output",
                    {
                        "output": result["output"],
                        "code": code,
                        "error": str(e)
                    }
                )
                return jsonify(error_response), 500
        else:
            # Handle execution errors
            error_type = result.get("error_type", "ExecutionError")
            error_message = result["error"]
            logger.error(f"Code execution failed: {error_message}")

            # Include detailed error information
            error_details = {
                "traceback": result["traceback"],
                "output": result["output"],
                "code": code
            }

            # Add line number and code context if available
            if "line_number" in result:
                error_details["line_number"] = result["line_number"]
            if "error_line" in result:
                error_details["error_line"] = result["error_line"]
            if "code_context" in result:
                error_details["code_context"] = result["code_context"]

            error_response = create_error_response(
                error_type,
                error_message,
                error_details
            )
            return jsonify(error_response), 500
    except Exception as e:
        # Catch any unexpected errors
        logger.error(f"Unexpected server error: {str(e)}", exc_info=True)
        error_response = create_error_response(
            "ServerError",
            f"An unexpected error occurred: {str(e)}",
            {"traceback": traceback.format_exc()}
        )
        return jsonify(error_response), 500
