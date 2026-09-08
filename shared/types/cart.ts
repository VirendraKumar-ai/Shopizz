import type { Product } from './product'

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  price: number // in paise (cached from product, re-validated on server)
}

export interface CartValidationResult {
  valid: boolean
  items: {
    productId: string
    name: string
    requestedQuantity: number
    availableQuantity: number
    unitPrice: number
    totalPrice: number
    isValid: boolean
    message?: string
  }[]
  subtotal: number
  shipping: number
  total: number
}
