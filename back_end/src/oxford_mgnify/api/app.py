from flask import Flask, request, jsonify
from ..main import get_script
from ..main_DS import query_deepseek
from flask_cors import CORS
import io
import contextlib
import traceback
import os
import json

app = Flask(__name__)
frontend_port = os.environ.get("FRONTEND_PORT", "3000")
CORS(app, origins=[f"http://localhost:{frontend_port}"])

def run_dynamic(code: str, globals_dicts=None, locals_dicts=None):
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
        return {"success": True, "globals": globals_dicts, "output": buf.getvalue()}
    except Exception as e:
        tb = traceback.format_exc()
        return {"success": False, "error": str(e), "traceback": tb, "output": buf.getvalue()}

@app.route("/code", methods=['POST'])
def returnCode():
    if not request.is_json:
        return jsonify({ "error": "Invalid Content Type" }), 400
    request_body = request.json
    if (request_body["model"] == "DeepSeek"):
        code = query_deepseek(request_body["query"])
        result = run_dynamic(code)
        print("Code was run with ChatGPT!")
    elif (request_body["model"] == "ChatGPT"):
        code = get_script(request_body["query"])
        result = run_dynamic(code)
        print("Code was run with DeepSeek!")
    else:
        code = ""
        result = {"success": False, "error": "Invalid Model chosen!", "traceback": "None", "output": "None"}

    if result["success"]:
        response = {
            "accession": json.loads(result["output"]),
            "code": code
        }
    else:
        response = {
            "accession": {},
            "error": result["error"],
            "traceback": result["traceback"],
            "output": result["output"],
            "code": code
        }
    return jsonify(response)





