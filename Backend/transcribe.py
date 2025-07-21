import os
import subprocess
import sys
import io
import logging
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tempfile
import shutil
import concurrent.futures
from typing import List

# Configuración de logs
LOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)
log_file = os.path.join(LOGS_DIR, f"transcribe_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

# Instalar dependencias si es necesario
try:
    import speech_recognition as sr
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'speechrecognition'])
    import speech_recognition as sr

try:
    import static_ffmpeg
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'static-ffmpeg'])
    import static_ffmpeg

# Asegurar salida en UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def get_ffmpeg_path():
    try:
        static_ffmpeg.add_paths()
        from static_ffmpeg import run
        ffmpeg_path, _ = run.get_or_fetch_platform_executables_else_raise()
        logging.info(f"FFmpeg path: {ffmpeg_path}")
        return ffmpeg_path
    except Exception as e:
        logging.error(f"Error obteniendo FFmpeg: {e}")
        raise EnvironmentError(f"No se pudo instalar o encontrar FFmpeg: {e}")

def convertir_ogg_a_wav(ruta_ogg, ffmpeg_path):
    ruta_wav = os.path.splitext(ruta_ogg)[0] + ".wav"
    try:
        subprocess.run([
            ffmpeg_path, "-i", ruta_ogg, ruta_wav, "-y"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        logging.info(f"Convertido {ruta_ogg} a {ruta_wav}")
        return ruta_wav
    except Exception as e:
        logging.error(f"Error al convertir OGG a WAV: {e} {ruta_ogg}")
        raise RuntimeError(f"Error al convertir OGG a WAV: {e} {ruta_ogg}")

def transcribir_audio(ruta_archivo, ffmpeg_path):
    recognizer = sr.Recognizer()
    if not os.path.exists(ruta_archivo):
        logging.error(f"El archivo {ruta_archivo} no existe.")
        raise FileNotFoundError(f"El archivo {ruta_archivo} no existe.")
    # Convertir a WAV si no es WAV
    if not ruta_archivo.lower().endswith(".wav"):
        ruta_archivo = convertir_ogg_a_wav(ruta_archivo, ffmpeg_path)
    with sr.AudioFile(ruta_archivo) as source:
        audio_data = recognizer.record(source)
    texto = recognizer.recognize_google(audio_data, language="es-ES")
    logging.info(f"Transcripción exitosa: {texto}")
    return texto

# --- API FastAPI ---
app = FastAPI(title="TranscribeWithFFMPEG API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ffmpeg_path = get_ffmpeg_path()

@app.post("/transcribe")
async def transcribe(files: List[UploadFile] = File(...)):
    results = {}
    errors = {}
    temp_dir = tempfile.mkdtemp()
    logging.info(f"Petición recibida con {len(files)} archivos.")

    def process_file(file: UploadFile):
        temp_path = os.path.join(temp_dir, file.filename)
        try:
            with open(temp_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
            texto = transcribir_audio(temp_path, ffmpeg_path)
            return (file.filename, texto, None)
        except Exception as e:
            logging.error(f"Error procesando {file.filename}: {e}")
            return (file.filename, None, str(e))
        finally:
            file.file.close()
            if os.path.exists(temp_path):
                os.remove(temp_path)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(process_file, file) for file in files]
        for future in concurrent.futures.as_completed(futures):
            filename, texto, error = future.result()
            if texto:
                results[filename] = texto
            else:
                errors[filename] = error

    shutil.rmtree(temp_dir)
    logging.info(f"Resultados: {results}")
    if errors:
        logging.warning(f"Errores: {errors}")
    return JSONResponse({"results": results, "errors": errors})

if __name__ == "__main__":
    uvicorn.run("transcribe:app", host="0.0.0.0", port=8000, reload=True)