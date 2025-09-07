from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/proxy/<path:url>')
def proxy(url):
    """Proxy endpoint to bypass CORS restrictions"""
    try:
        # Reconstruct the full URL
        full_url = f"http://{url}"
        
        # Make the request to the external API
        response = requests.get(full_url, timeout=10)
        
        # Return the JSON response
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Proxy error: {str(e)}"}), 500

@app.route('/health')
def health():
    return jsonify({"status": "Proxy server running", "port": 5002})

if __name__ == '__main__':
    print("🔗 Starting CORS Proxy Server on port 5002...")
    print("📡 Available endpoints:")
    print("   - ISS Position: http://localhost:5002/proxy/api.open-notify.org/iss-now.json")
    print("   - Astronauts: http://localhost:5002/proxy/api.open-notify.org/astros.json")
    app.run(host='0.0.0.0', port=5002, debug=True)