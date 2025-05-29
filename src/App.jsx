import React, { useRef, useState } from 'react';

const App = () => {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  const handleTap = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const db = await openDB();
          const tx = db.transaction('videos', 'readwrite');
          await tx.store.add({ video: blob, timestamp: new Date().toISOString() });
        };

        recorder.start(1000); // For iOS compatibility
        setRecording(true);
      } catch (err) {
        console.error('Camera error:', err);
      }
    } else {
      recorderRef.current?.stop();
      setRecording(false);
    }
  };

  return (
    <div
      onClick={handleTap}
      style={{
        background: 'black',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        cursor: 'pointer',
      }}
    />
  );
};

const openDB = async () => {
  const { openDB } = await import('idb');
  return openDB('video-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export default App;
