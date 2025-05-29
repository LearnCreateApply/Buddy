import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'mkzs9674'; // Replace with your actual password

const formatFilename = (timestamp) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${yyyy}-${mm}-${dd}-${String(h).padStart(2, '0')}-${m}${ampm}.webm`;
};

const Archive = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, and not entering password -> redirect
    if (!authenticated) {
      const hasVisited = window.performance?.navigation?.type === 1 || performance.getEntriesByType("navigation")[0]?.type === "reload";
      if (hasVisited) {
        navigate('/');
      }
    }
  }, [authenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      await loadVideos();
    } else {
      navigate('/');
    }
  };

  const loadVideos = async () => {
    const db = await openDB('video-db', 1);
    const all = await db.getAll('videos');
    const formatted = all.map((entry) => ({
      ...entry,
      url: URL.createObjectURL(entry.video),
      filename: formatFilename(entry.timestamp),
    }));
    setVideos(formatted.reverse());
  };

  const clearVideos = async () => {
    const db = await openDB('video-db', 1);
    await db.clear('videos');
    setVideos([]);
  };

  if (!authenticated) {
    return (
      <div
        style={{
          background: '#000',
          color: '#fff',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{ padding: '10px', fontSize: '1rem' }}
          />
          <br />
          <button type="submit" style={{ marginTop: '1rem', padding: '10px 20px' }}>
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {videos.length === 0 ? (
        <></>
      ) : (
        <ul>
          {videos.map((vid, i) => (
            <li key={i} style={{ marginBottom: '10px',listStyle:'none' }}>
              <a href={vid.url} download={vid.filename}>
                {vid.filename}
              </a>
            </li>
          ))}
        </ul>
      )}
      {videos.length > 0 && (
        <button
          onClick={clearVideos}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
        >
          *
        </button>
      )}
    </div>
  );
};

export default Archive;
