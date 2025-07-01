from flask import Flask, request, jsonify, make_response
from flask_cors import CORS  # <-- Añade esta importación

app = Flask(__name__)
CORS(app)  # <-- Añade esta línea para habilitar CORS

# ======== AÑADE ESTA FUNCIÓN NUEVA ========
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

from flask import Flask, request, jsonify
import requests
import os
from io import BytesIO
from PIL import Image

app = Flask(__name__)

# Configurar API key de Replicate
REPLICATE_API_KEY = os.getenv('REPLICATE_API_KEY')
MODEL_VERSION = "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b"

@app.route('/enhance', methods=['POST'])
def enhance_image():
    # Verificar si se envió la imagen
    if 'image' not in request.files:
        return jsonify({"error": "No se proporcionó imagen"}), 400
    
    image_file = request.files['image']
    
    # Procesar con Replicate API
    try:
        # Subir imagen a un servicio temporal
        img = Image.open(image_file)
        img_buffer = BytesIO()
        img.save(img_buffer, format="PNG")
        img_buffer.seek(0)
        
        # Llamar a Replicate
        response = requests.post(
            "https://api.replicate.com/v1/predictions",
            headers={"Authorization": f"Token {REPLICATE_API_KEY}"},
            json={
                "version": MODEL_VERSION,
                "input": {
                    "image": f"data:image/png;base64,{base64.b64encode(img_buffer.getvalue()).decode('utf-8')}",
                    "scale": 4
                }
            }
        )
        
        if response.status_code != 201:
            return jsonify({"error": "Error en Replicate API"}), 500
        
        # Obtener resultado
        prediction_id = response.json()["id"]
        result_url = f"https://api.replicate.com/v1/predictions/{prediction_id}"
        
        # Esperar procesamiento
        while True:
            status_response = requests.get(result_url, headers={"Authorization": f"Token {REPLICATE_API_KEY}"})
            status_data = status_response.json()
            
            if status_data["status"] == "succeeded":
                return jsonify({"output": status_data["output"]})
            elif status_data["status"] in ["failed", "canceled"]:
                return jsonify({"error": "Procesamiento fallido"}), 500
            time.sleep(2)
                
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
