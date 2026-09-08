export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayCheckoutOptions {
  keyId: string
  orderId: string
  amount: number
  currency?: string
  name?: string
  description?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, any>
}

export const useRazorpay = () => {
  const isScriptLoaded = ref(false)
  const isLoadingScript = ref(false)

  // Dynamically load the Razorpay checkout.js script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        return resolve(false)
      }

      if ((window as any).Razorpay) {
        isScriptLoaded.value = true
        return resolve(true)
      }

      const existingScript = document.getElementById('razorpay-checkout-script')
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          isScriptLoaded.value = true
          resolve(true)
        })
        return
      }

      isLoadingScript.value = true
      const script = document.createElement('script')
      script.id = 'razorpay-checkout-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true

      script.onload = () => {
        isScriptLoaded.value = true
        isLoadingScript.value = false
        resolve(true)
      }

      script.onerror = () => {
        isLoadingScript.value = false
        console.error('Failed to load Razorpay Checkout SDK.')
        resolve(false)
      }

      document.body.appendChild(script)
    })
  }

  // Open the Razorpay Checkout Modal
  const openCheckout = async (
    options: RazorpayCheckoutOptions
  ): Promise<RazorpayPaymentSuccessResponse> => {
    const loaded = await loadRazorpayScript()
    if (!loaded || !(window as any).Razorpay) {
      throw new Error('Could not initialize Razorpay checkout. Please check your internet connection.')
    }

    return new Promise((resolve, reject) => {
      const razorpayOptions = {
        key: options.keyId,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: options.name || 'Shopizz',
        description: options.description || 'Artisanal Studio Marketplace',
        order_id: options.orderId,
        prefill: {
          name: options.prefill?.name || '',
          email: options.prefill?.email || '',
          contact: options.prefill?.contact || '',
        },
        theme: {
          color: '#94442a', // Shopizz signature terracotta
        },
        notes: options.notes || {},
        handler: (response: RazorpayPaymentSuccessResponse) => {
          resolve(response)
        },
        modal: {
          ondismiss: () => {
            reject(new Error('PAYMENT_CANCELLED'))
          },
          escape: true,
          backdropclose: false,
        },
      }

      try {
        const rzp = new (window as any).Razorpay(razorpayOptions)
        rzp.on('payment.failed', (response: any) => {
          console.error('[Razorpay Payment Failed]:', response.error)
          reject(new Error(response?.error?.description || 'Payment transaction failed.'))
        })
        rzp.open()
      } catch (err) {
        reject(err)
      }
    })
  }

  return {
    isScriptLoaded,
    loadRazorpayScript,
    openCheckout,
  }
}
