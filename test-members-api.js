// Test script for members API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

async function testMembersAPI() {
  console.log('Testing Members API...')
  
  try {
    // Test members list endpoint
    console.log('\n1. Testing members list endpoint...')
    const membersResponse = await fetch(`${API_BASE_URL}/admin/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })
    
    console.log('Members list response status:', membersResponse.status)
    const membersData = await membersResponse.text()
    console.log('Members list response:', membersData)
    
    if (membersResponse.ok) {
      const members = JSON.parse(membersData)
      console.log('✅ Members list accessible')
      
      if (members.members && members.members.length > 0) {
        const firstMember = members.members[0]
        console.log('First member ID:', firstMember.id)
        
        // Test individual member endpoint
        console.log('\n2. Testing individual member endpoint...')
        const memberResponse = await fetch(`${API_BASE_URL}/admin/members/${firstMember.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        })
        
        console.log('Member detail response status:', memberResponse.status)
        const memberData = await memberResponse.text()
        console.log('Member detail response:', memberData)
        
        if (memberResponse.ok) {
          console.log('✅ Individual member endpoint accessible')
        } else {
          console.log('❌ Individual member endpoint failed:', memberResponse.status)
        }
      } else {
        console.log('No members found to test individual endpoint')
      }
    } else {
      console.log('❌ Members list failed:', membersResponse.status)
    }
    
  } catch (error) {
    console.log('❌ Members API test failed:', error.message)
  }
}

testMembersAPI()





























