async function testAccountPage() {
  try {
    const res = await fetch('http://localhost:3000/account')
    console.log('GET /account status:', res.status, res.statusText)
    const text = await res.text()
    if (text.includes('Cannot find package')) {
      console.error('ERROR: Still contains package error!')
    } else {
      console.log('✓ /account rendered without module errors!')
    }
  } catch (err: any) {
    console.error('Fetch error:', err.message)
  }
}
testAccountPage()
