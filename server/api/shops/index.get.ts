import { and, desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { ownerApplications, products, users } from '~~/db/schema'

// Curated high-res default craft imagery matching Image 1 approved design
const DEFAULT_SHOP_PRESETS: Record<string, { image: string; category: string; badge: string }> = {
  'studio earth': {
    image: '/images/studio-earth.jpg',
    category: 'Home & Living',
    badge: '🌿',
  },
  'bare & bone': {
    image: '/images/bare-and-bone.jpg',
    category: 'Ceramics',
    badge: 'bb',
  },
  fovea: {
    image: '/images/fovea.jpg',
    category: 'Jewelry ›',
    badge: 'fv',
  },
  nuvie: {
    image: '/images/nuvie.jpg',
    category: 'Clean Beauty ›',
    badge: 'nv',
  },
}

const FALLBACK_IMAGES = [
  '/images/studio-earth.jpg',
  '/images/bare-and-bone.jpg',
  '/images/fovea.jpg',
  '/images/nuvie.jpg',
]

function generateBadge(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toLowerCase()
  }
  return name.slice(0, 2).toLowerCase()
}

export default defineEventHandler(async () => {
  try {
    // 1. Query approved owner applications
    const approvedOwners = await db
      .select({
        id: users.id,
        name: users.name,
        shopName: ownerApplications.shopName,
        description: ownerApplications.description,
        imageUrl: ownerApplications.imageUrl,
        logoUrl: ownerApplications.logoUrl,
        applicationId: ownerApplications.id,
      })
      .from(ownerApplications)
      .innerJoin(users, eq(ownerApplications.userId, users.id))
      .where(
        and(
          eq(ownerApplications.status, 'APPROVED'),
          eq(users.role, 'OWNER'),
          eq(users.isActive, true)
        )
      )
      .orderBy(desc(ownerApplications.createdAt))

    // Helper to generate URL-safe slugs
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')

    // 2. Map existing shops to API response
    const existingShops = approvedOwners.map((owner, index) => {
      const displayName = owner.shopName || owner.name
      const lowerName = displayName.toLowerCase().trim()
      const preset = DEFAULT_SHOP_PRESETS[lowerName]

      const fallbackImage = preset?.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
      const category = preset?.category || 'Independent Craft'
      const badge = owner.logoUrl ? '' : (preset?.badge || generateBadge(displayName))
      const shopSlug = slugify(displayName)

      return {
        id: owner.id,
        name: displayName,
        slug: shopSlug,
        description: owner.description || 'Independent creator on Shopizz',
        category,
        imageUrl: owner.imageUrl || fallbackImage,
        logoUrl: owner.logoUrl || null,
        badge,
        link: `/shop/${shopSlug}`,
      }
    })

    // 3. If there are fewer than 4 shops in DB, combine with approved mockup makers
    const defaultMakers = [
      {
        id: 'studio-earth',
        name: 'Studio Earth',
        slug: 'studio-earth',
        description: 'Botanical and organic living objects',
        category: 'Home & Living',
        imageUrl: '/images/studio-earth.jpg',
        logoUrl: null,
        badge: '🌿',
        link: '/shop/studio-earth',
      },
      {
        id: 'bare-and-bone',
        name: 'Bare & Bone',
        slug: 'bare-and-bone',
        description: 'Hand-thrown sculptural ceramic pottery',
        category: 'Ceramics',
        imageUrl: '/images/bare-and-bone.jpg',
        logoUrl: null,
        badge: 'bb',
        link: '/shop/bare-and-bone',
      },
      {
        id: 'fovea',
        name: 'Fovea',
        slug: 'fovea',
        description: 'Artisan handcrafted statement jewelry',
        category: 'Jewelry ›',
        imageUrl: '/images/fovea.jpg',
        logoUrl: null,
        badge: 'fv',
        link: '/shop/fovea',
      },
      {
        id: 'nuvie',
        name: 'Nuvie',
        slug: 'nuvie',
        description: 'Pure botanical oils and skincare essentials',
        category: 'Clean Beauty ›',
        imageUrl: '/images/nuvie.jpg',
        logoUrl: null,
        badge: 'nv',
        link: '/shop/nuvie',
      },
    ]

    // Deduplicate by name if existing shops match default ones
    const seenNames = new Set(existingShops.map((s) => s.name.toLowerCase()))
    const combinedShops = [
      ...existingShops,
      ...defaultMakers.filter((m) => !seenNames.has(m.name.toLowerCase())),
    ]

    return {
      success: true,
      shops: combinedShops,
    }
  } catch (error) {
    console.error('Error fetching shops:', error)
    return {
      success: false,
      shops: [],
    }
  }
})
