import { redirect } from 'next/navigation'
import { handleAuth } from '@workos-inc/authkit-nextjs'
import { usersTable, rootFoldersTable, countsTable } from '@/db/schema'
import { db } from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import chalk from 'chalk'

export const GET = handleAuth({
  onSuccess: async ({ user }) => {
    if (!user) return redirect('/login')
    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
    if (currentUser.length === 0) {
      const userInsert: typeof usersTable.$inferInsert = {
        id: user.id,
        email: user.email,
      }

      await db.insert(usersTable).values(userInsert)
      await db.insert(rootFoldersTable).values([
        { userId: user.id, name: 'Downloads', pathname: '/folders/Downloads' },
        { userId: user.id, name: 'Documents', pathname: '/folders/Documents' },
        { userId: user.id, name: 'Music', pathname: '/folders/Music' },
        { userId: user.id, name: 'Pictures', pathname: '/folders/Pictures' },
      ])
      await db
        .insert(countsTable)
        .values({ userId: user.id, folderCount: 4, fileCount: 0 })
      console.log(chalk.magenta(' NEW USER INSERTED'))
    } else {
      console.log(chalk.magenta(' USER ALREADY EXISTS'))
    }
  },
})
