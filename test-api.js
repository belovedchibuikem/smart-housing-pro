// Simple test script to check API connectivity
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

async function testAPI() {
  console.log('Testing API connectivity...')
  console.log('API Base URL:', API_BASE_URL)
  
  try {
    // Test basic API endpoint
    const response = await fetch(`${API_BASE_URL}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })
    
    console.log('Test endpoint response status:', response.status)
    const data = await response.text()
    console.log('Test endpoint response:', data)
    
    if (response.ok) {
      console.log('✅ API is accessible')
    } else {
      console.log('❌ API returned error:', response.status)
    }
  } catch (error) {
    console.log('❌ API connection failed:', error.message)
  }
}

testAPI()





















