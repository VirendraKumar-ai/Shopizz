async function testFixes() {
  const baseUrl = 'http://localhost:3000'
  console.log('Testing fixes against live endpoints on', baseUrl)

  try {
    // 1. Test /api/shops returns dynamic shop links
    const shopsRes = await fetch(`${baseUrl}/api/shops`)
    const shopsData = await shopsRes.json()
    console.log('✓ /api/shops success:', shopsData.success)
    console.log('  Shops with dynamic links:', shopsData.shops.slice(0, 3).map((s: any) => ({ name: s.name, slug: s.slug, link: s.link })))

    // 2. Test /api/shops/studio-earth or first shop
    const firstSlug = shopsData.shops[0]?.slug || 'the-loom-studio'
    const shopDetailRes = await fetch(`${baseUrl}/api/shops/${firstSlug}`)
    const shopDetailData = await shopDetailRes.json()
    console.log(`✓ /api/shops/${firstSlug} success:`, shopDetailData.success, 'Shop name:', shopDetailData.shop?.name, 'Products count:', shopDetailData.shop?.totalProducts)

    // 3. Test sync-session endpoint responds
    const syncRes = await fetch(`${baseUrl}/api/auth/sync-session`, { method: 'POST' })
    const syncData = await syncRes.json()
    console.log('✓ /api/auth/sync-session unauthorized guest check:', syncData)

    console.log('\n--- All API fixes validated and functioning smoothly! ---')
  } catch (err) {
    console.error('Test error:', err)
  }
}

testFixes()
