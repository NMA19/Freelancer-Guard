import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Simple test to see if React is working
function TestApp() {
  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'blue' }}>🛡️ FreelancerGuard Test</h1>
      <p>If you can see this, React is working!</p>
      <button style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Test Button
      </button>
    </div>
  );
}

// App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <TestApp />
    </AuthProvider>
  );
}

export default App;
