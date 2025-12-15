import React, { useState } from 'react';
import api from './services/api';

const TestDirectLogin = () => {
  const [result, setResult] = useState<string>('');

  const testLogin = async () => {
    try {
      setResult('Testing...');
      
      const response = await api.post('/login', {
        email: 'admin@apiu.edu',
        password: 'password'
      });
      
      console.log('Direct API Response:', response);
      console.log('Response data:', response.data);
      
      if (response.data.success && response.data.data) {
        setResult(`SUCCESS: ${JSON.stringify(response.data, null, 2)}`);
        
        // Test storing token
        localStorage.setItem('token', response.data.data.token);
        console.log('Token stored:', response.data.data.token);
      } else {
        setResult(`FAILED: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error('Direct login error:', error);
      setResult(`ERROR: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Direct Login Test</h2>
      <button onClick={testLogin}>Test Direct Login</button>
      <pre style={{ marginTop: '20px', background: '#f5f5f5', padding: '10px' }}>
        {result}
      </pre>
    </div>
  );
};

export default TestDirectLogin;