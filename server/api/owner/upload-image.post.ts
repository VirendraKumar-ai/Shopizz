import { getCloudinary } from '~~/server/utils/cloudinary'

export default defineEventHandler(async (event) => {
  // Only authenticated owners can upload product images
  await requireOwner(event)

  const parts = await readMultipartFormData(event)

  if (!parts || parts.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No image was uploaded',
    })
  }

  const file = parts.find((part) => part.name === 'file')

  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image file is required',
    })
  }

  // Allowed image types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
  ]

  if (!file.type || !allowedTypes.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only JPG, PNG, WEBP and AVIF images are allowed',
    })
  }

  // Maximum file size: 5 MB
  const maxFileSize = 5 * 1024 * 1024

  if (file.data.length > maxFileSize) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image size must be less than 5 MB',
    })
  }

  try {
      const cloudinary = getCloudinary()

    const result = await new Promise<{
      secure_url: string
      public_id: string
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'shopizz/products',
          resource_type: 'image',
          transformation: [
            {
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error)
            return
          }

          if (!result) {
            reject(new Error('Cloudinary returned no result'))
            return
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          })
        },
      )

      uploadStream.end(file.data)
    })

    return {
      success: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        alt: file.filename || 'Shopizz product image',
      },
    }
  } catch (error) {
    console.error('Cloudinary image upload failed:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload image',
    })
  }
})