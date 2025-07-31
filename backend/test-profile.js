const fetch = require('node-fetch');

async function testProfileEndpoint() {
  try {
    // Test the new NextAuth profile endpoint
    const response = await fetch('http://localhost:8080/api/users/profile/nextauth/test-user-id', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testProfileEndpoint(); 