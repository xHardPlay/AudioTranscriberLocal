import { useState } from 'react';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (event) => {
    setError('');
    setErrors({});
    const selected = Array.from(event.target.files || event.dataTransfer.files);
    setFiles(selected);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setLoading(true);
    setError('');
    setResults([]);
    setErrors({});
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file)); // CAMBIO: 'audios' -> 'files'
    try {
      const res = await fetch('/api/transcribe', { // CAMBIO: endpoint correcto
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error al subir los archivos');
      const data = await res.json();
      // CAMBIO: Parsear respuesta como {results, errors}
      setResults(
        Object.entries(data.results || {}).map(([name, text]) => ({ name, text }))
      );
      setErrors(data.errors || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Transcribir audios de WhatsApp</h1>
      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ border: '2px dashed #888', padding: 30, marginBottom: 20 }}
      >
        <input
          type="file"
          accept="audio/*"
          multiple
          style={{ display: 'none' }}
          id="file-input"
          onChange={handleFiles}
        />
        <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
          Arrastra y suelta audios aquí o haz clic para seleccionar archivos
        </label>
      </div>
      {files.length > 0 && (
        <div>
          <h3>Archivos seleccionados:</h3>
          <ul>
            {files.map((file, idx) => (
              <li key={idx}>
                {file.name}
                {errors[file.name] && (
                  <div style={{ color: 'red', fontSize: '0.95em' }}>
                    Error: {errors[file.name]}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleUpload} disabled={loading || !files.length}>
        {loading ? 'Transcribiendo...' : 'Subir y transcribir'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results.length > 0 && (
        <div>
          <h3>Resultados:</h3>
          <ul>
            {results.map((res, idx) => (
              <li key={idx}>
                <b>{res.name}:</b> <span>{res.text || 'Transcripción pendiente...'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
