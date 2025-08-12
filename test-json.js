// Simple test script to debug JSON parsing issue
async function testAddExperience() {
  const testData = {
    title: "Test Experience",
    description: "Test Description", 
    category: "Web Development",
    client_name: "Test Client",
    rating: 5,
    project_value: 1000
  };

  console.log('🧪 Testing add experience with data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch('http://localhost:5000/api/experiences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const responseText = await response.text();
    console.log('📜 Raw response:', responseText);

    try {
      const responseData = JSON.parse(responseText);
      console.log('✅ Parsed response:', responseData);
    } catch (e) {
      console.log('❌ Failed to parse response as JSON');
    }

  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

// Also test the simple test endpoint
async function testSimple() {
  const testData = { test: "data" };
  
  console.log('🧪 Testing simple endpoint with data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch('http://localhost:5000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const responseText = await response.text();
    console.log('📜 Test endpoint raw response:', responseText);

    try {
      const responseData = JSON.parse(responseText);
      console.log('✅ Test endpoint parsed response:', responseData);
    } catch (e) {
      console.log('❌ Failed to parse test response as JSON');
    }

  } catch (error) {
    console.error('❌ Test endpoint fetch error:', error);
  }
}

// Run tests
console.log('🚀 Starting JSON debugging tests...');
testSimple();
setTimeout(() => testAddExperience(), 1000);
