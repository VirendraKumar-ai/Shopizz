export interface ProductCategory {
  id?: string
  name: string
  slug: string
  description?: string | null
}

export interface ProductImage {
  id?: string
  url: string
  alt?: string | null
  isPrimary?: boolean
  sortOrder?: number
}

export interface ProductOwner {
  id?: string
  name: string
}

export interface ProductColor {
  name: string
  hex: string
  inStock?: boolean
}

export interface ProductDetails {
  materials?: string
  care?: string
  fit?: string
  ethics?: string[]
  sustainability?: string[]
}

export interface ProductShop {
  id?: string
  name: string
  location?: string
  description?: string
  logoUrl?: string
  isVerified?: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  sku?: string
  shortDescription?: string | null
  description?: string | null
  price: number
  compareAtPrice?: number | null
  costPrice?: number
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  isFeatured: boolean
  stock: number
  category?: ProductCategory | null
  ownerId?: string
  categoryId?: string
  images: ProductImage[]
  owner?: ProductOwner | null
  shop?: ProductShop | null
  createdAt?: Date
  updatedAt?: Date

  // Dynamic variants & specs
  colors?: ProductColor[]
  sizes?: string[]
  details?: ProductDetails

  // Social proof
  rating?: number
  reviewCount?: number
  soldCount?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  productCount?: number
}

