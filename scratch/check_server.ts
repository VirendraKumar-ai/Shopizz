async function testDevServer() {
  try {
    const res = await fetch('http://localhost:3000')
    console.log('Dev server status:', res.status, res.statusText)
  } catch (err: any) {
    console.error('Dev server connection error:', err.message)
  }
}
testDevServer()
