import type { Product, Category } from '~~/shared/types/product'

export const useProducts = () => {
  const fetchProducts = async (params?: {
    category?: string
    search?: string
    featured?: boolean
  }) => {
    return await $fetch<{
      success: boolean
      products: Product[]
    }>('/api/products', {
      query: params,
    })
  }

  const fetchCategories = async () => {
    return await $fetch<{
      success: boolean
      categories: Category[]
    }>('/api/categories')
  }

  const fetchProductBySlug = async (slug: string) => {
    return await $fetch<{
      success: boolean
      product: Product
    }>(`/api/products/${slug}`)
  }

  return {
    fetchProducts,
    fetchCategories,
    fetchProductBySlug,
  }
}
