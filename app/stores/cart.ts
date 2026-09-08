import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { CartItem, CartValidationResult } from '~~/shared/types/cart'
import type { Product } from '~~/shared/types/product'

export const useCartStore = defineStore('cart', () => {
  // Free shipping threshold: ₹5,000 (500000 paise)
  const FREE_SHIPPING_THRESHOLD = 500000
  const STANDARD_SHIPPING_FEE = 15000 // ₹150 (15000 paise)

  const items = useLocalStorage<CartItem[]>('shopizz_cart_items', [])

  // Auto-sanitize corrupted legacy entries (e.g. quantity === NaN)
  const sanitizeCart = () => {
    if (!Array.isArray(items.value)) {
      items.value = []
      return
    }

    items.value = items.value.filter((item) => {
      const qty = Number(item.quantity)
      const price = Number(item.price || item.product?.price)
      return (
        item &&
        item.productId &&
        Number.isFinite(qty) &&
        qty > 0 &&
        Number.isFinite(price) &&
        price >= 0
      )
    }).map((item) => {
      // Ensure product sub-object is well-formed with images
      const imgUrl =
        item.product?.images?.[0]?.url ||
        (item.product as any)?.imageUrl ||
        (item.product as any)?.productImage ||
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80'

      const normalizedImages = item.product?.images?.length
        ? item.product.images
        : [{ url: imgUrl, alt: item.product?.name || 'Product Image' }]

      return {
        ...item,
        quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
        price: Number(item.price || item.product?.price) || 0,
        product: {
          ...item.product,
          id: item.productId,
          name: item.product?.name || 'Handcrafted Piece',
          slug: item.product?.slug || '',
          price: Number(item.price || item.product?.price) || 0,
          images: normalizedImages,
        } as Product,
      }
    })
  }

  // Run initial sanitize
  if (typeof window !== 'undefined') {
    sanitizeCart()
  }

  const itemCount = computed(() => {
    return items.value.reduce((total, item) => {
      const qty = Number(item.quantity)
      return total + (Number.isFinite(qty) ? qty : 0)
    }, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => {
      const price = Number(item.product?.price ?? item.price ?? 0)
      const qty = Number(item.quantity ?? 1)
      const validPrice = Number.isFinite(price) ? price : 0
      const validQty = Number.isFinite(qty) ? qty : 0
      return total + validPrice * validQty
    }, 0)
  })

  const shipping = computed(() => {
    if (items.value.length === 0 || subtotal.value >= FREE_SHIPPING_THRESHOLD) {
      return 0
    }
    return STANDARD_SHIPPING_FEE
  })

  const total = computed(() => {
    return subtotal.value + shipping.value
  })

  const isEmpty = computed(() => items.value.length === 0)

  const freeShippingProgress = computed(() => {
    if (subtotal.value >= FREE_SHIPPING_THRESHOLD) return 100
    if (subtotal.value <= 0) return 0
    return Math.min(100, Math.round((subtotal.value / FREE_SHIPPING_THRESHOLD) * 100))
  })

  const freeShippingRemaining = computed(() => {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.value)
  })

  const formatPrice = (amount: number) => {
    const num = Number(amount)
    const validAmount = Number.isFinite(num) ? num : 0
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(validAmount / 100)
  }

  const addItem = (rawProduct: any, quantity = 1): boolean => {
    if (!rawProduct) return false

    // Normalize incoming product object whether from full Product model or shop API
    const productId = rawProduct.id || rawProduct.productId
    if (!productId) return false

    const rawPrice = Number(rawProduct.price)
    const safePrice = Number.isFinite(rawPrice) ? rawPrice : 0

    const rawStock = Number(rawProduct.stock)
    const safeStock = Number.isFinite(rawStock) && rawStock > 0 ? rawStock : 99

    const rawQty = Number(quantity)
    const safeQty = Number.isFinite(rawQty) && rawQty > 0 ? Math.round(rawQty) : 1

    const imgUrl =
      rawProduct.images?.[0]?.url ||
      rawProduct.imageUrl ||
      rawProduct.productImage ||
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80'

    const normalizedImages = Array.isArray(rawProduct.images) && rawProduct.images.length > 0
      ? rawProduct.images
      : [{ url: imgUrl, alt: rawProduct.name || 'Product Image' }]

    const normalizedProduct: Product = {
      id: productId,
      name: rawProduct.name || rawProduct.productName || 'Handcrafted Piece',
      slug: rawProduct.slug || rawProduct.productSlug || '',
      description: rawProduct.description || '',
      price: safePrice,
      compareAtPrice: Number.isFinite(Number(rawProduct.compareAtPrice)) ? Number(rawProduct.compareAtPrice) : null,
      ownerId: rawProduct.ownerId || '',
      categoryId: rawProduct.categoryId || '',
      status: rawProduct.status || 'ACTIVE',
      isFeatured: Boolean(rawProduct.isFeatured),
      details: rawProduct.details || {},
      stock: safeStock,
      images: normalizedImages,
      category: rawProduct.category || (rawProduct.categoryName ? { id: '', name: rawProduct.categoryName, slug: '' } : undefined),
      owner: rawProduct.owner || (rawProduct.ownerName ? { id: '', name: rawProduct.ownerName, email: '', role: 'OWNER', isActive: true, createdAt: new Date() } : undefined),
      createdAt: rawProduct.createdAt ? new Date(rawProduct.createdAt) : new Date(),
      updatedAt: rawProduct.updatedAt ? new Date(rawProduct.updatedAt) : new Date(),
    }

    const existingIndex = items.value.findIndex(
      (item) => item.productId === productId
    )

    if (existingIndex > -1) {
      const currentItem = items.value[existingIndex]
      const currentQty = Number(currentItem.quantity) || 0
      const newQuantity = Math.min(
        currentQty + safeQty,
        safeStock
      )
      items.value[existingIndex] = {
        productId,
        quantity: Math.max(1, newQuantity),
        product: normalizedProduct,
        price: safePrice,
      }
    } else {
      const initialQty = Math.min(safeQty, safeStock)
      items.value.push({
        productId,
        product: normalizedProduct,
        quantity: Math.max(1, initialQty),
        price: safePrice,
      })
    }

    return true
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const index = items.value.findIndex((item) => item.productId === productId)
    if (index === -1) return

    const numQty = Number(quantity)
    if (!Number.isFinite(numQty) || numQty <= 0) {
      removeItem(productId)
      return
    }

    const maxStock = Number(items.value[index].product?.stock) || 99
    items.value[index].quantity = Math.min(Math.round(numQty), maxStock)
  }

  const removeItem = (productId: string) => {
    items.value = items.value.filter((item) => item.productId !== productId)
  }

  const clearCart = () => {
    items.value = []
  }

  const validateCartOnServer = async () => {
    if (isEmpty.value) {
      return {
        valid: true,
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      } as CartValidationResult
    }

    const payload = items.value.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))

    const response = await $fetch<{
      success: boolean
      validation: CartValidationResult
    }>('/api/cart/validate', {
      method: 'POST',
      body: {
        items: payload,
      },
    })

    return response.validation
  }

  return {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    isEmpty,
    freeShippingProgress,
    freeShippingRemaining,
    formatPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    validateCartOnServer,
    sanitizeCart,
  }
})
