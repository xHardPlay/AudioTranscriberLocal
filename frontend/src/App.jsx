import { useState, useRef } from 'react';
import './App.css';
import { FaMicrophoneAlt, FaCopy, FaArrowUp, FaArrowDown, FaUpload } from 'react-icons/fa';

function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const dragItem = useRef();
  const dragOverItem = useRef();

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
    files.forEach((file) => formData.append('files', file));
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error al subir los archivos');
      const data = await res.json();
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

  const handleCopy = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch (e) {
      alert('No se pudo copiar');
    }
  };

  const handleCopyAll = async () => {
    const allText = results.map(r => r.text).join('\n\n');
    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch (e) {
      alert('No se pudo copiar');
    }
  };

  // Drag & Drop nativo para resultados
  const handleDragStart = (idx) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    const fromIdx = dragItem.current;
    const toIdx = dragOverItem.current;
    if (fromIdx === undefined || toIdx === undefined || fromIdx === toIdx) return;
    const reordered = Array.from(results);
    const [removed] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, removed);
    setResults(reordered);
    dragItem.current = undefined;
    dragOverItem.current = undefined;
  };

  // Mover resultado hacia arriba
  const moveUp = (idx) => {
    if (idx === 0) return;
    const reordered = Array.from(results);
    const temp = reordered[idx - 1];
    reordered[idx - 1] = reordered[idx];
    reordered[idx] = temp;
    setResults(reordered);
  };
  // Mover resultado hacia abajo
  const moveDown = (idx) => {
    if (idx === results.length - 1) return;
    const reordered = Array.from(results);
    const temp = reordered[idx + 1];
    reordered[idx + 1] = reordered[idx];
    reordered[idx] = temp;
    setResults(reordered);
  };

  return (
    <div className="app-bg">
      <div className="container">
        <div className="title-row">
          <FaMicrophoneAlt className="title-icon" />
          <h1>Transcriptor de Audio</h1>
        </div>
        <div className="subtitle">Creado por Carlos Ezequiel Centurion xHardPlay 2025</div>
        <div
          className="dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept="audio/*"
            multiple
            style={{ display: 'none' }}
            id="file-input"
            onChange={handleFiles}
          />
          <label htmlFor="file-input">
            <FaUpload style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Arrastra y suelta audios aquí o haz clic para seleccionar archivos
          </label>
        </div>
        {files.length > 0 && (
          <div>
            <h3>Archivos seleccionados:</h3>
            <ul className="file-list">
              {files.map((file, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {file.name}
                  {errors[file.name] && (
                    <span className="badge-error">Error</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={handleUpload} disabled={loading || !files.length}>
          <FaUpload style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {loading ? 'Transcribiendo...' : 'Subir y transcribir'}
        </button>
        {loading && (
          <div className="spinner" aria-label="Cargando...">
            <div className="lds-dual-ring"></div>
          </div>
        )}
        {error && <div className="banner-error">{error}</div>}
        <hr className="divider" />
        {results.length > 0 && (
          <div>
            <h3>Resultados:</h3>
            <button
              className={copiedAll ? 'copied copy-all-btn' : 'copy-btn copy-all-btn'}
              onClick={handleCopyAll}
              style={{ marginBottom: 24 }}
            >
              <FaCopy style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {copiedAll ? '¡Todo copiado!' : 'Copiar todo'}
            </button>
            <div>
              {results.map((res, idx) => (
                <div
                  className="result-card"
                  key={res.name}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  style={{ cursor: 'grab', opacity: loading ? 0.7 : 1 }}
                >
                  <div className="result-title-row">
                    <div className="result-title">{res.name}</div>
                    <div className="result-arrows">
                      <button
                        className="arrow-btn"
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        aria-label="Subir"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        className="arrow-btn"
                        onClick={() => moveDown(idx)}
                        disabled={idx === results.length - 1}
                        aria-label="Bajar"
                      >
                        <FaArrowDown />
                      </button>
                    </div>
                  </div>
                  <div className="result-content">
                    <span className="result-text">{res.text || 'Transcripción pendiente...'}</span>
                    <button
                      className={copiedIdx === idx ? 'copied' : 'copy-btn'}
                      onClick={() => handleCopy(res.text, idx)}
                    >
                      <FaCopy style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      {copiedIdx === idx ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
