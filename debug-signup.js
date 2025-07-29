// Test script to debug signup issue
const API_BASE_URL = 'http://localhost:3001/api';

async function testSignup() {
  try {
    console.log('Testing signup with URL:', `${API_BASE_URL}/auth/signup`);
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    
    if (!response.ok) {
      console.error('Response not OK');
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success:', data);
    
  } catch (error) {
    console.error('Fetch error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
  }
}

// Run the test
testSignup();
