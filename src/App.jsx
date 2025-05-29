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

const App = () => {
  const [recording, setRecording] = useState(false);
  const [useNativeCapture, setUseNativeCapture] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (
      !window.MediaRecorder ||
      (!MediaRecorder.isTypeSupported('video/webm') &&
        !MediaRecorder.isTypeSupported('video/mp4'))
    ) {
      setUseNativeCapture(true);
    }
  }, []);

  const handleClick = async () => {
    if (useNativeCapture) return; // No click handler in fallback mode

    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;

        let options = {};
        if (MediaRecorder.isTypeSupported('video/webm')) {
          options.mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options.mimeType = 'video/mp4';
        }

        mediaRecorderRef.current = new MediaRecorder(stream, options);
        chunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: options.mimeType || 'video/webm' });
          const db = await initDB();
          await db.add(STORE_NAME, { video: blob, timestamp: new Date().toISOString() });
        };

        mediaRecorderRef.current.start(1000);
        setRecording(true);
      } catch (err) {
        console.error('Error starting recording:', err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setRecording(false);
    }
  };

  return useNativeCapture ? (
    <input
      type="file"
      accept="video/*"
      capture="environment"
      onChange={async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const db = await initDB();
        await db.add(STORE_NAME, { video: file, timestamp: new Date().toISOString() });
        e.target.value = null;
      }}
      style={{ display: 'none' }}
    />
  ) : (
    <>
    
    <div
      onClick={handleClick}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        margin: 0,
        padding: 0,
      }}
    />
    <div><a href="/0">0</a></div>
    </>
  );
};

export default App;
