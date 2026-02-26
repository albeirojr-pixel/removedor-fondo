from http.server import BaseHTTPRequestHandler
from rembg import remove
from PIL import Image
import io
import base64
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Leer el body de la petición
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            # Obtener imagen en base64
            image_data = data['image'].split(',')[1]
            image_bytes = base64.b64decode(image_data)
            
            # Abrir imagen
            input_image = Image.open(io.BytesIO(image_bytes))
            
            # Remover fondo con rembg
            output_image = remove(input_image)
            
            # Convertir resultado a base64
            buffered = io.BytesIO()
            output_image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            # Enviar respuesta
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'imageUrl': f'data:image/png;base64,{img_str}'
            }
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            # Error
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()