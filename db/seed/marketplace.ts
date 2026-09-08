import 'dotenv/config'

import { eq } from 'drizzle-orm'

import { db } from '../../server/utils/db'
import {
  categories,
  inventory,
  productImages,
  products,
  users,
} from '../schema'

const OWNER_EMAIL = 'dev.frontend1997@gmail.om'

const categoryData = [
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Everyday clothing with a considered point of view.',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Functional pieces with character and craft.',
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Objects that make everyday spaces feel personal.',
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Small rituals and sensory essentials.',
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Thoughtful objects for everyday living.',
  },
]

const productData = [
  {
    name: 'Linen Overshirt',
    slug: 'linen-overshirt',
    sku: 'SN-FSH-001',
    categorySlug: 'fashion',
    shortDescription: 'Relaxed linen overshirt for effortless everyday layering.',
    description:
      'A breathable linen overshirt designed with a relaxed silhouette and clean finishing. Easy to wear across seasons.',
    price: 249900,
    compareAtPrice: 329900,
    costPrice: 120000,
    stock: 24,
    isFeatured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Relaxed Cotton Trousers',
    slug: 'relaxed-cotton-trousers',
    sku: 'SN-FSH-002',
    categorySlug: 'fashion',
    shortDescription: 'Soft cotton trousers with a relaxed contemporary fit.',
    description:
      'Comfortable everyday trousers cut from soft cotton with a relaxed leg and understated finish.',
    price: 219900,
    compareAtPrice: 279900,
    costPrice: 105000,
    stock: 18,
    isFeatured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ribbed Knit Top',
    slug: 'ribbed-knit-top',
    sku: 'SN-FSH-003',
    categorySlug: 'fashion',
    shortDescription: 'Minimal ribbed knit top with a softly structured shape.',
    description:
      'A versatile ribbed knit designed for simple styling and comfortable everyday wear.',
    price: 159900,
    compareAtPrice: 199900,
    costPrice: 70000,
    stock: 32,
    isFeatured: false,
    imageUrl:
      'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Everyday Leather Tote',
    slug: 'everyday-leather-tote',
    sku: 'SN-ACC-001',
    categorySlug: 'accessories',
    shortDescription: 'Structured leather tote designed for everyday carry.',
    description:
      'A spacious everyday tote with a clean silhouette, durable construction and timeless detailing.',
    price: 389900,
    compareAtPrice: 449900,
    costPrice: 190000,
    stock: 12,
    isFeatured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Canvas Utility Bag',
    slug: 'canvas-utility-bag',
    sku: 'SN-ACC-002',
    categorySlug: 'accessories',
    shortDescription: 'Practical canvas bag with a utilitarian character.',
    description:
      'A lightweight canvas carryall designed for everyday errands, work and weekend use.',
    price: 129900,
    compareAtPrice: 159900,
    costPrice: 55000,
    stock: 27,
    isFeatured: false,
    imageUrl:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sculptural Ceramic Vase',
    slug: 'sculptural-ceramic-vase',
    sku: 'SN-HOM-001',
    categorySlug: 'home-living',
    shortDescription: 'Hand-finished ceramic vase with a sculptural profile.',
    description:
      'A tactile ceramic object designed to work as both a functional vase and a sculptural accent.',
    price: 179900,
    compareAtPrice: 229900,
    costPrice: 80000,
    stock: 15,
    isFeatured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Handwoven Table Runner',
    slug: 'handwoven-table-runner',
    sku: 'SN-HOM-002',
    categorySlug: 'home-living',
    shortDescription: 'Textured handwoven runner for everyday tablescapes.',
    description:
      'A woven textile with subtle texture and natural character, designed to soften everyday dining spaces.',
    price: 99900,
    compareAtPrice: 129900,
    costPrice: 42000,
    stock: 21,
    isFeatured: false,
    imageUrl:
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Botanical Candle',
    slug: 'botanical-candle',
    sku: 'SN-BEA-001',
    categorySlug: 'beauty',
    shortDescription: 'A warm botanical candle for slow everyday rituals.',
    description:
      'A softly scented candle inspired by botanical notes and quiet evening rituals.',
    price: 79900,
    compareAtPrice: 99900,
    costPrice: 30000,
    stock: 40,
    isFeatured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Stoneware Mug',
    slug: 'stoneware-mug',
    sku: 'SN-LIF-001',
    categorySlug: 'lifestyle',
    shortDescription: 'Simple stoneware mug with a tactile handmade feel.',
    description:
      'A durable everyday mug with a considered shape and softly textured ceramic finish.',
    price: 69900,
    compareAtPrice: 89900,
    costPrice: 26000,
    stock: 50,
    isFeatured: false,
    imageUrl:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Minimal Pendant Lamp',
    slug: 'minimal-pendant-lamp',
    sku: 'SN-LIF-002',
    categorySlug: 'lifestyle',
    shortDescription: 'Minimal pendant light with a sculptural silhouette.',
    description:
      'A clean pendant light designed to bring warm, focused illumination to contemporary interiors.',
    price: 429900,
    compareAtPrice: 499900,
    costPrice: 210000,
    stock: 8,
    isFeatured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1200&q=80',
  },
]

async function seedMarketplace() {
  console.log('Starting marketplace seed...')

  // --------------------------------------------------
  // 1. Find owner
  // --------------------------------------------------

  const owner = await db.query.users.findFirst({
    where: eq(users.email, OWNER_EMAIL),
  })

  if (!owner) {
    throw new Error(
      `Owner account not found: ${OWNER_EMAIL}`
    )
  }

  if (owner.role !== 'OWNER') {
    throw new Error(
      `User ${OWNER_EMAIL} is not an OWNER. Current role: ${owner.role}`
    )
  }

  console.log(`Owner found: ${owner.name}`)

  // --------------------------------------------------
  // 2. Categories
  // --------------------------------------------------

  const categoryMap = new Map<string, string>()

  for (const category of categoryData) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, category.slug),
    })

    if (existing) {
      categoryMap.set(category.slug, existing.id)

      console.log(`Category exists: ${category.name}`)
      continue
    }

    const [created] = await db
      .insert(categories)
      .values(category)
      .returning()

    categoryMap.set(category.slug, created.id)

    console.log(`Category created: ${category.name}`)
  }

  // --------------------------------------------------
  // 3. Products
  // --------------------------------------------------

  for (const product of productData) {
    const categoryId = categoryMap.get(product.categorySlug)

    if (!categoryId) {
      throw new Error(
        `Category not found: ${product.categorySlug}`
      )
    }

    const existing = await db.query.products.findFirst({
      where: eq(products.sku, product.sku),
    })

    let productId: string

    if (existing) {
      productId = existing.id

      await db
        .update(products)
        .set({
          ownerId: owner.id,
          categoryId,
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          costPrice: product.costPrice,
          status: 'ACTIVE',
          isFeatured: product.isFeatured,
          updatedAt: new Date(),
        })
        .where(eq(products.id, existing.id))

      console.log(`Product updated: ${product.name}`)
    } else {
      const [created] = await db
        .insert(products)
        .values({
          ownerId: owner.id,
          categoryId,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          costPrice: product.costPrice,
          status: 'ACTIVE',
          isFeatured: product.isFeatured,
        })
        .returning()

      productId = created.id

      console.log(`Product created: ${product.name}`)
    }

    // ------------------------------------------------
    // 4. Product image
    // ------------------------------------------------

    const existingImage =
      await db.query.productImages.findFirst({
        where: eq(productImages.productId, productId),
      })

    if (!existingImage) {
      await db.insert(productImages).values({
        productId,
        url: product.imageUrl,
        alt: product.name,
        sortOrder: 0,
        isPrimary: true,
      })

      console.log(`Image created: ${product.name}`)
    }

    // ------------------------------------------------
    // 5. Inventory
    // ------------------------------------------------

    const existingInventory =
      await db.query.inventory.findFirst({
        where: eq(inventory.productId, productId),
      })

    if (existingInventory) {
      await db
        .update(inventory)
        .set({
          quantity: product.stock,
          updatedAt: new Date(),
        })
        .where(eq(inventory.id, existingInventory.id))

      console.log(`Inventory updated: ${product.name}`)
    } else {
      await db.insert(inventory).values({
        productId,
        quantity: product.stock,
        reservedQuantity: 0,
      })

      console.log(`Inventory created: ${product.name}`)
    }
  }

  console.log('')
  console.log('Marketplace seed completed successfully.')
  console.log(`Categories: ${categoryData.length}`)
  console.log(`Products: ${productData.length}`)
}

seedMarketplace()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Marketplace seed failed:', error)
    process.exit(1)
  })