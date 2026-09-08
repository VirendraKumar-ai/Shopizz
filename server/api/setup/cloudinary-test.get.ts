import { getCloudinary } from '~~/server/utils/cloudinary'

export default defineEventHandler(async () => {
  try {
    const cloudinary = getCloudinary()

    const result = await cloudinary.api.ping()

    return {
      success: true,
      message: 'Cloudinary connection successful',
      status: result.status,
    }
  } catch (error: any) {
    console.error('Cloudinary connection test failed:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Cloudinary connection failed',
    })
  }
})