from flask import Flask, request, jsonify
from ..main import get_script
from flask_cors import CORS
import io
import contextlib
import traceback

app = Flask(__name__)
CORS(app, origins=["http://localhost:3001"])

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
    print(request_body)
    code = get_script(request_body["query"])
    result = run_dynamic(code)
    if result["success"]:
        response = {
            "ascension": result["output"],
            "code": code
        }
    else:
        response = {
            "error": result["error"],
            "traceback": result["traceback"],
            "output": result["output"],
            "code": code
        }
    return jsonify(response)





