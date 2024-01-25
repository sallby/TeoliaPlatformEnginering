from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import subprocess
import json

app = FastAPI()

# Configurer CORS pour autoriser toutes les origines, méthodes, et en-têtes pour les requêtes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def index():
    html_path = Path(__file__).parent / "../" / "forms" / "run-terraform.html"
    return FileResponse(str(html_path))

@app.post('/run-terraform')
async def run_terraform(request: Request):
    try:
        data = await request.json()
        json_file_path = data.get('json_file_path')
        with open(json_file_path, 'r') as file:
            json_data = json.load(file)

        terraform_commands = json_data.get('terraform_commands', [])

        responses = []
        for cmd in terraform_commands:
            terraform_command = cmd['command']
            terraform_arguments = cmd.get('arguments', [])

            command = ['terraform', terraform_command] + terraform_arguments

            result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            responses.append({
                'command': terraform_command,
                'output': result.stdout,
                'error': result.stderr,
                'status': 'success' if result.returncode == 0 else 'error'
            })

        response = {'commands_responses': responses}
        return JSONResponse(content={"message": "Requête POST réussie", "response": response})

    except Exception as e:
        response = {'status': 'error', 'error_message': str(e)}
        raise HTTPException(status_code=500, detail=f"Erreur interne du serveur: {str(e)}")

if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='localhost', port=5001)
