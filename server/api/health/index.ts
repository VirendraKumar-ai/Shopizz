import { sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  try {
    const result = await db.execute(
      sql`SELECT NOW() as current_time`
    )

    return {
      success: true,
      message: 'Database connection successful',
      time: result.rows[0]?.current_time
    }
  } catch (error) {
    console.error('Database connection failed:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed'
    })
  }
})