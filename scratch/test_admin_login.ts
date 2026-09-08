async function testLogin() {
  const baseUrl = 'http://localhost:3000'
  console.log('Testing login endpoint for sharadmaurya4600@gmail.com...')

  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sharadmaurya4600@gmail.com',
        password: 'Admin@123'
      })
    })

    const data = await res.json()
    console.log('Status:', res.status)
    console.log('Response body:', data)
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

testLogin()
