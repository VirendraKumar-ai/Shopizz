import 'dotenv/config'
import { db } from '../server/utils/db'
import { sql } from 'drizzle-orm'
import { products } from '../db/schema'

async function run() {
  console.log('Seeding rich dynamic specifications, materials, and colors for catalog products...')

  const linenDetails = {
    philosophy: "Thoughtfully designed for comfort, versatility and everyday wear. A modern classic you'll reach for again and again.",
    specifications: {
      Fit: 'Relaxed',
      Closure: 'Button-down',
      Collar: 'Classic shirt collar',
      Sleeve: 'Full sleeve (with button cuffs)',
      Pocket: 'Single chest pocket',
      Length: 'Regular',
      Style: 'Overshirt / Layering piece',
      Occasion: 'Everyday, Work, Casual',
      Gender: 'Unisex'
    },
    materials: {
      title: 'Materials & Care',
      intro: 'Made with carefully sourced materials and designed to last. Follow the care instructions to keep your linen overshirt looking its best.',
      badges: [
        { title: '100% Linen', desc: 'Natural, breathable, lightweight', icon: 'ph:shield-check-bold' },
        { title: 'Soft Texture', desc: 'Gets softer with every wash', icon: 'ph:sparkle-bold' },
        { title: 'Consciously Made', desc: 'Low impact, longer lasting', icon: 'ph:leaf-bold' }
      ],
      careInstructions: [
        { icon: '🧺', text: 'Machine wash cold (gentle cycle)' },
        { icon: '🧴', text: 'Use mild detergent' },
        { icon: '🚫', text: 'Do not bleach' },
        { icon: '🌬️', text: 'Line dry in shade' },
        { icon: '♨️', text: 'Warm iron if needed' },
        { icon: '🚫', text: 'Do not tumble dry' },
        { icon: '🚫', text: 'Do not dry clean' }
      ]
    },
    shipping: {
      freeShippingThreshold: 1499,
      shippingPoints: [
        'Dispatched within 2–3 business days',
        'Delivery in 4–7 business days',
        'Real-time tracking via email & account',
        'We currently ship across India'
      ],
      returnPoints: [
        'Items must be unused, unwashed and in original condition',
        'Initiate a return from your account',
        'Refund processed within 5–7 business days',
        'For damaged or incorrect items, contact us within 48 hours'
      ]
    }
  }

  const linenColors = [
    { name: 'Oat', hex: '#D6C7B2', inStock: true },
    { name: 'Olive', hex: '#4B5320', inStock: true },
    { name: 'Charcoal', hex: '#2A2B2A', inStock: true },
    { name: 'Rust', hex: '#A34F38', inStock: true }
  ]

  const linenSizes = ['XS', 'S', 'M', 'L', 'XL']

  // Update linen-overshirt
  await db
    .update(products)
    .set({
      description: 'A modern essential, this linen overshirt blends timeless craft with everyday comfort. Crafted from premium, breathable linen, it features a relaxed silhouette, natural texture, and clean finishing. Wear it layered or on its own — perfect for effortless, understated style across seasons.',
      colors: linenColors,
      sizes: linenSizes,
      details: linenDetails
    })
    .where(sql`slug = 'linen-overshirt'`)

  // Update other products with sensible defaults
  const allProds = await db.select().from(products)
  for (const p of allProds) {
    if (p.slug !== 'linen-overshirt' && !p.details) {
      await db
        .update(products)
        .set({
          colors: p.colors || [
            { name: 'Natural', hex: '#E6DEC8', inStock: true },
            { name: 'Clay', hex: '#9E6D59', inStock: true },
            { name: 'Onyx', hex: '#1C1C1C', inStock: true }
          ],
          sizes: p.sizes || ['S', 'M', 'L'],
          details: {
            philosophy: 'Handcrafted with organic textures and attention to detail. Designed for mindful living.',
            specifications: {
              Material: 'Artisanal Natural Fiber',
              Craft: 'Handcrafted Studio Finish',
              Fit: 'Standard Relaxed',
              Origin: 'Jaipur, Rajasthan',
              Care: 'Hand wash / Gentle Cycle'
            },
            materials: {
              title: 'Materials & Craft',
              intro: 'Responsibly sourced raw materials designed to age with grace.',
              badges: [
                { title: 'Artisanal Craft', desc: 'Small batch production', icon: 'ph:hand-heart-bold' },
                { title: 'Pure Materials', desc: 'Zero synthetic blends', icon: 'ph:sparkle-bold' },
                { title: 'Sustainable', desc: 'Low footprint creation', icon: 'ph:leaf-bold' }
              ],
              careInstructions: [
                { icon: '🧺', text: 'Gentle wash in cold water' },
                { icon: '🧴', text: 'Natural mild liquid detergent' },
                { icon: '🌬️', text: 'Dry in shade away from direct heat' },
                { icon: '♨️', text: 'Warm iron on reverse side' }
              ]
            },
            shipping: {
              freeShippingThreshold: 1499,
              shippingPoints: [
                'Dispatched within 2–3 business days',
                'Delivery in 4–7 business days',
                'Secure doorstep tracking'
              ],
              returnPoints: [
                'Easy 7-day studio returns',
                'Refund credited within 5–7 business days'
              ]
            }
          }
        })
        .where(sql`id = ${p.id}`)
    }
  }

  console.log('Seeded details for all products successfully!')
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
