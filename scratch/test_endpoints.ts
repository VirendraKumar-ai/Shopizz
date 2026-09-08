async function testHttp() {
  console.log('--- TESTING API HTTP ENDPOINTS ---')

  // 1. Test GET /api/products/linen-overshirt/reviews
  const res = await fetch('http://localhost:3000/api/products/linen-overshirt/reviews')
  console.log('GET /api/products/linen-overshirt/reviews Status:', res.status)

  if (res.ok) {
    const json: any = await res.json()
    console.log('Overall Rating:', json.stats?.averageRating)
    console.log('Total Reviews:', json.stats?.totalReviews)
    console.log('Distribution:', json.stats?.distribution)
    console.log('Percentages:', json.stats?.percentages)
    console.log('Reviews count:', json.reviews?.length)
    if (json.reviews?.length > 0) {
      console.log('First Review sample:', {
        rating: json.reviews[0].rating,
        title: json.reviews[0].title,
        author: json.reviews[0].author,
        isVerified: json.reviews[0].isVerifiedPurchase,
        sellerReply: json.reviews[0].sellerReply ? 'YES' : 'NO'
      })
    }
  } else {
    console.error('Failed to fetch reviews API:', await res.text())
  }

  // 2. Test SSR page render
  const pageRes = await fetch('http://localhost:3000/product/linen-overshirt')
  console.log('GET /product/linen-overshirt HTML Status:', pageRes.status)
  const html = await pageRes.text()
  console.log('Page HTML contains "Customer Reviews & Ratings":', html.includes('Customer Reviews & Ratings'))
  console.log('Page HTML contains "Verified Purchase":', html.includes('Verified Purchase'))

  process.exit(0)
}

testHttp().catch(err => {
  console.error(err)
  process.exit(1)
})
