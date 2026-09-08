import Razorpay from 'razorpay'

export const getRazorpay = () => {
    const config = useRuntimeConfig()

    if (!config.razorpayKeyId || !config.razorpayKeySecret) {
        throw new Error('Razorpay configuration is missing')
    }

    return new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpayKeySecret,
    })
}