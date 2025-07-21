
python -m venv venv
./venv/scripts/activate
pip install -r requirements.txt
uvicorn transcribe:app --host 0.0.0.0 --port 8000





# TranscribeWithFFMPEG

Este proyecto permite transcribir archivos de audio (WAV/OGG) a texto usando Python, SpeechRecognition y FFmpeg. El flujo es completamente automático: crea y usa un entorno virtual, instala dependencias, descarga FFmpeg según el sistema operativo y registra logs en /logs/.

## Uso rápido (CLI)

1. Clona el repositorio y entra a la carpeta:
   ```
   git clone <repo_url>
   cd TranscribeWithFFMPEG
   ```
2. Ejecuta el script con el archivo de audio como argumento:
   ```
   python transcribe.py <ruta_al_audio>
   ```
   - El script creará un entorno virtual si no existe, instalará dependencias y FFmpeg automáticamente.
   - Los logs se guardan en la carpeta `/logs/`.

## Uso como API REST

### 1. Instalar dependencias (si no lo hiciste antes)

```
pip install -r requirements.txt
```

### 2. Iniciar la API

```
uvicorn transcribe:app --host 0.0.0.0 --port 8000
```

La API quedará disponible en `http://localhost:8000` (o en la IP de tu servidor).

### 3. Endpoint principal

#### POST `/transcribe`
- **Descripción:** Recibe múltiples archivos de audio (WAV/OGG) y devuelve sus transcripciones.
- **Tipo de contenido:** `multipart/form-data`
- **Campo:** `files` (uno o varios archivos)
- **Respuesta:**
  ```json
  {
    "results": {
      "archivo1.ogg": "Texto transcrito...",
      "archivo2.wav": "Texto transcrito..."
    },
    "errors": {
      "archivo3.ogg": "Error de procesamiento..."
    }
  }
  ```

#### Ejemplo con curl

```
curl -X POST "http://localhost:8000/transcribe" \
  -F "files=@/ruta/a/archivo1.ogg" \
  -F "files=@/ruta/a/archivo2.wav"
```

#### Ejemplo con Postman
- Método: POST
- URL: `http://localhost:8000/transcribe`
- Body: form-data
  - Key: `files` (selecciona tipo "File" y agrega uno o varios archivos)

### 4. Logs
- Todos los logs de peticiones y errores se guardan en la carpeta `/logs/`.

## Requisitos
- Python 3.8+
- Acceso a internet para la primera ejecución (descarga dependencias y FFmpeg)

## Notas
- El script y la API funcionan en Windows y Linux.
- Si tienes problemas con FFmpeg o la transcripción, revisa los logs en `/logs/`.
- La API es pública y no tiene autenticación por defecto.

--- 