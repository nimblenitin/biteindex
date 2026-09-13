from flask import Flask, jsonify, request
from tools import retrieve_info
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods = ['GET'])
def home():
    data = "hello world"
    return jsonify({'data': data})

@app.route('/get_info', methods = ['GET'])
def disp():
    try:
        url = request.args.get("url")
        print(f"Received URL: {url}")
        data = retrieve_info(url)
        return jsonify({'data': data})
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
