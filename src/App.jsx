import React, { useRef, useState, useEffect } from 'react';
import { openDB } from 'idb';

const DB_NAME = 'video-db';
const STORE_NAME = 'videos';

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

const formatTimestamp = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = String(hours).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}-${hh}-${minutes}${ampm}`;
};

function App() {
  const [recording, setRecording] = useState(false);
  const [savedVideos, setSavedVideos] = useState([]);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const startFetching = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const timestamp = new Date();

        const db = await initDB();
        const videoEntry = {
          video: blob,
          timestamp,
        };

        await db.add(STORE_NAME, videoEntry);
        loadSavedVideos();
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      alert('Error accessing camera: ' + error.message);
    }
  };

  const stopFetching = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };

  const loadSavedVideos = async () => {
    const db = await initDB();
    const allVideos = await db.getAll(STORE_NAME);
    const formatted = allVideos.map((entry) => ({
      ...entry,
      url: URL.createObjectURL(entry.video),
      filename: `${formatTimestamp(new Date(entry.timestamp))}.webm`,
    }));
    setSavedVideos(formatted.reverse()); // newest first
  };

  const clearData = async () => {
    const db = await initDB();
    await db.clear(STORE_NAME);
    setSavedVideos([]);
  };

  useEffect(() => {
    loadSavedVideos();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Fetch Data</h2>

      {!recording ? (
        <button onClick={startFetching} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          Fetch
        </button>
      ) : (
        <button onClick={stopFetching} style={{ padding: '0.5rem 1rem', fontSize: '1rem', backgroundColor: 'red', color: 'white' }}>
          Stop
        </button>
      )}

      {savedVideos.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Previous Recordings</h3>
          <ul>
            {savedVideos.map((vid, i) => (
              <li key={i}>
                <a href={vid.url} download={vid.filename}>
                  {vid.filename}
                </a>
              </li>
            ))}
          </ul>
          <button
            onClick={clearData}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Clear Data
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
