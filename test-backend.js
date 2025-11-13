// Test backend API endpoints
const API_BASE_URL = "http://localhost:8000/api"

async function testBackend() {
  console.log('Testing backend API endpoints...')
  
  try {
    // Test members endpoint
    console.log('\n1. Testing /test-members...')
    const membersResponse = await fetch(`${API_BASE_URL}/test-members`)
    console.log('Status:', membersResponse.status)
    const membersData = await membersResponse.json()
    console.log('Response:', JSON.stringify(membersData, null, 2))
    
    if (membersData.members && membersData.members.length > 0) {
      const firstMember = membersData.members[0]
      console.log('\n2. Testing /test-members/' + firstMember.id + '...')
      const memberResponse = await fetch(`${API_BASE_URL}/test-members/${firstMember.id}`)
      console.log('Status:', memberResponse.status)
      const memberData = await memberResponse.json()
      console.log('Response:', JSON.stringify(memberData, null, 2))
      
      console.log('\n3. Testing /test-documents?member_id=' + firstMember.id + '...')
      const docsResponse = await fetch(`${API_BASE_URL}/test-documents?member_id=${firstMember.id}`)
      console.log('Status:', docsResponse.status)
      const docsData = await docsResponse.json()
      console.log('Response:', JSON.stringify(docsData, null, 2))
    }
    
  } catch (error) {
    console.log('Error:', error.message)
  }
}

testBackend()




















