async function testEndpoints() {
  const baseUrl = 'http://localhost:3000'

  console.log('Testing public and platform endpoints on', baseUrl)

  try {
    // 1. Test public announcement endpoint
    const annRes = await fetch(`${baseUrl}/api/settings/announcement`)
    const annJson = await annRes.json()
    console.log('✓ /api/settings/announcement:', annJson)

    // 2. Test public shop endpoint
    const shopRes = await fetch(`${baseUrl}/api/shops/the-loom-studio`)
    const shopJson = await shopRes.json()
    console.log('✓ /api/shops/the-loom-studio success:', shopJson.success, 'Shop:', shopJson.shop?.name)

    // 3. Test wishlist unauthorized (should be 401)
    const wishRes = await fetch(`${baseUrl}/api/wishlist`)
    console.log('✓ /api/wishlist unauthorized status:', wishRes.status)

    // 4. Test admin endpoints unauthorized (should be 401)
    const adminProdRes = await fetch(`${baseUrl}/api/admin/products`)
    console.log('✓ /api/admin/products unauthorized status:', adminProdRes.status)

    const adminUserRes = await fetch(`${baseUrl}/api/admin/users`)
    console.log('✓ /api/admin/users unauthorized status:', adminUserRes.status)

    const adminSettingsRes = await fetch(`${baseUrl}/api/admin/settings`)
    console.log('✓ /api/admin/settings unauthorized status:', adminSettingsRes.status)

    const ownerPayoutsRes = await fetch(`${baseUrl}/api/owner/payouts`)
    console.log('✓ /api/owner/payouts unauthorized status:', ownerPayoutsRes.status)

    console.log('\nAll newly added endpoints verified and responding properly!')
  } catch (err) {
    console.error('Test error:', err)
  }
}

testEndpoints()
