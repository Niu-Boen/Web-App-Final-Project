// Debug login test
async function testLogin() {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@apiu.edu',
        password: 'password'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success && data.data) {
      console.log('Login successful!');
      console.log('User:', data.data.user);
      console.log('Token:', data.data.token);
      
      // Test storing in localStorage
      localStorage.setItem('token', data.data.token);
      console.log('Token stored in localStorage');
    } else {
      console.log('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}

testLogin();