import { useState } from 'react';

export default function FeaslyLanding() {
  console.log('FeaslyLanding function called');
  
  // Simplified return for debugging
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #f0f0f0, #ffffff)', 
      padding: '20px',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '20px' }}>
        DEBUG: FeaslyLanding Component Working
      </h1>
      <p style={{ color: '#666', fontSize: '16px' }}>
        If you can see this, the component is rendering correctly.
      </p>
      <button 
        style={{ 
          background: '#007bff', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => console.log('Button clicked')}
      >
        Test Button
      </button>
    </div>
  );
}