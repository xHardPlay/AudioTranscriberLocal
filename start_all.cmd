@echo off
REM Lanzador para Backend y Frontend (instalación automática si es la primera vez)

REM --- BACKEND ---
cd Backend
if not exist venv (
    echo Creando entorno virtual de Python...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Falló la creación del entorno virtual.
        pause
        exit /b
    )
    echo Entorno virtual creado.
    pause
)

if not exist venv\Scripts\python.exe (
    echo ERROR: No se encontró el ejecutable de Python en el entorno virtual.
    pause
    exit /b
)

if not exist venv\Lib\site-packages\fastapi (
    echo Instalando dependencias de backend...
    venv\Scripts\pip.exe install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Falló la instalación de dependencias de backend.
        pause
        exit /b
    )
    echo Dependencias de backend instaladas.
    pause
)

REM Verificar e instalar uvicorn si falta
if not exist venv\Lib\site-packages\uvicorn (
    echo Instalando uvicorn...
    venv\Scripts\pip.exe install uvicorn
    if errorlevel 1 (
        echo ERROR: Falló la instalación de uvicorn.
        pause
        exit /b
    )
    echo Uvicorn instalado.
    pause
)
cd ..

REM --- FRONTEND ---
cd frontend
if not exist node_modules (
    echo Instalando dependencias de frontend...
    npm install
    if errorlevel 1 (
        echo ERROR: Falló la instalación de dependencias de frontend.
        pause
        exit /b
    )
    echo Dependencias de frontend instaladas.
    pause
)
cd ..

REM Lanzar Backend (FastAPI/Uvicorn) en nueva ventana usando python -m uvicorn
start cmd /k "cd Backend && venv\Scripts\activate && venv\Scripts\python.exe -m uvicorn transcribe:app --host 0.0.0.0 --port 8000"

REM Lanzar Frontend (Vite) en nueva ventana
start cmd /k "cd frontend && npm run dev"

REM Esperar unos segundos y abrir navegador
ping 127.0.0.1 -n 5 > nul
start http://localhost:5173 