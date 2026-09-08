export interface Shop {
  id: string
  name: string
  description?: string | null
  category: string
  imageUrl: string
  logoUrl?: string | null
  badge: string
  link: string
}
