import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { users } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user?.id) {
    return {
      success: false,
      user: null,
      synced: false,
    }
  }

  // Fetch the latest user record directly from database
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!currentUser || !currentUser.isActive) {
    await clearUserSession(event)
    return {
      success: false,
      user: null,
      synced: false,
    }
  }

  const updatedUserData = {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
  }

  // Update session cookie with the latest DB role and profile
  await setUserSession(event, {
    user: updatedUserData,
  })

  return {
    success: true,
    user: updatedUserData,
    synced: true,
  }
})
