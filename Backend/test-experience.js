// Test experience creation
const testExperience = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/experiences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTczNDAzNTI4M30.somevalidtoken'
      },
      body: JSON.stringify({
        title: 'Test Experience',
        description: 'This is a test experience to verify the form works',
        client_name: 'Test Client',
        client_email: 'client@example.com',
        category: 'Web Development',
        client_type: 'Individual',
        rating: 5,
        project_value: 1000,
        payment_method: 'PayPal',
        project_duration_days: 7
      })
    });
    
    const result = await response.text();
    console.log('Test response:', result);
  } catch (error) {
    console.error('Test error:', error);
  }
};

testExperience();
