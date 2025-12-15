import React from 'react';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', color: '#111827', marginBottom: '2rem' }}>
          APIU Cafeteria System
        </h1>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '1rem' }}>
            Welcome to the APIU Cafeteria Operation System
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            System is loading...
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

