async function checkTabs() {
  const pageRes = await fetch('http://localhost:3000/product/linen-overshirt')
  const html = await pageRes.text()
  console.log('Page Status:', pageRes.status)
  console.log('Contains "Product Description":', html.includes('Product Description'))
  console.log('Contains "Natural Textures":', html.includes('Natural Textures'))
  console.log('Contains "Details":', html.includes('Details'))
  console.log('Contains "Materials":', html.includes('Materials'))
  console.log('Contains "Shipping & Returns":', html.includes('Shipping &amp; Returns') || html.includes('Shipping & Returns'))
  console.log('Contains "Reviews":', html.includes('Reviews'))
  process.exit(0)
}

checkTabs().catch(console.error)
