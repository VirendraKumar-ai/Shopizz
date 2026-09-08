import { getRazorpay } from '~~/server/utils/razorpay'

export default defineEventHandler(async () => {
    try {
        const razorpay = getRazorpay()

        await razorpay.orders.all({
            count: 1,
        })

        return {
            success: true,
            message: 'Razorpay Test Mode connection successful',
        }
    } catch (error) {
        console.error('Razorpay connection test failed:', error)

        throw createError({
            statusCode: 500,
            statusMessage: 'Razorpay connection failed',
        })
    }
})