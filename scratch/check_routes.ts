async function testAllRoutes() {
  const routes = ['/account', '/account/returns', '/owner/account']
  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`)
      console.log(`GET ${r} -> status: ${res.status} ${res.statusText}`)
    } catch (err: any) {
      console.error(`Error fetching ${r}:`, err.message)
    }
  }
}
testAllRoutes()
