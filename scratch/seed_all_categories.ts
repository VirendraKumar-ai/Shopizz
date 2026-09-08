import 'dotenv/config'
import { db } from '../server/utils/db'
import { categories } from '../db/schema/categories'
import { eq } from 'drizzle-orm'

const allCategoriesToAdd = [
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Everyday slow-fashion clothing and timeless wardrobe staples.',
    sortOrder: 1,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Handcrafted leather goods, jewelry, and artisan accessories.',
    sortOrder: 2,
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Botanical formulations, organic skincare, and sensory rituals.',
    sortOrder: 3,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Handcrafted ceramics, organic textiles, and ambient home decor.',
    sortOrder: 4,
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Thoughtfully designed objects for mindful everyday living.',
    sortOrder: 5,
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Curated books, hand-bound journals, and inspiring publications.',
    sortOrder: 6,
  },
  {
    name: 'Art & Decor',
    slug: 'art-decor',
    description: 'Original prints, sculptural art, pottery, and statement decor.',
    sortOrder: 7,
  },
  {
    name: 'Stationery',
    slug: 'stationery',
    description: 'Artisan notebooks, brass pens, desk accessories, and papercraft.',
    sortOrder: 8,
  },
  {
    name: 'Food & Drinks',
    slug: 'food-drinks',
    description: 'Small-batch pantry essentials, single-origin teas, and craft brews.',
    sortOrder: 9,
  },
  {
    name: 'Pets',
    slug: 'pets',
    description: 'Handmade pet accessories, organic treats, and mindful pet care.',
    sortOrder: 10,
  },
  {
    name: 'Kids & Baby',
    slug: 'kids-baby',
    description: 'Non-toxic wooden toys, organic cotton babywear, and nursery essentials.',
    sortOrder: 11,
  },
]

async function seed() {
  console.log('Seeding categories...')
  for (const cat of allCategoriesToAdd) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, cat.slug))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(categories).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        status: 'ACTIVE',
      })
      console.log(`Inserted category: ${cat.name} (${cat.slug})`)
    } else {
      await db
        .update(categories)
        .set({
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          status: 'ACTIVE',
        })
        .where(eq(categories.slug, cat.slug))
      console.log(`Updated category: ${cat.name} (${cat.slug})`)
    }
  }

  const final = await db.select().from(categories).orderBy(categories.sortOrder)
  console.log(`Total active categories now in DB: ${final.length}`)
  process.exit(0)
}

seed().catch(err => {
  console.error('Failed to seed categories:', err)
  process.exit(1)
})
