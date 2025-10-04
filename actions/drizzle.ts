'use server'

import 'server-only'

import { withAuth } from '@workos-inc/authkit-nextjs'
import { eq } from 'drizzle-orm'
import { db } from '@/db/drizzle'
import {
  usersTable,
  rootFoldersTable,
  foldersTable,
  filesTable,
  countsTable,
} from '@/db/schema'

export const getUser = async () => {
  const { user } = await withAuth({ ensureSignedIn: true })
  return await db.select().from(usersTable).where(eq(usersTable.id, user.id))
}

export const getRootFolders = async () => {
  const { user } = await withAuth({ ensureSignedIn: true })
  return await db
    .select()
    .from(rootFoldersTable)
    .where(eq(rootFoldersTable.userId, user.id))
}

export const getFolders = async () => {
  const { user } = await withAuth({ ensureSignedIn: true })
  return await db
    .select()
    .from(foldersTable)
    .where(eq(foldersTable.userId, user.id))
    .orderBy(foldersTable.id)
}

export const getFiles = async () => {
  const { user } = await withAuth({ ensureSignedIn: true })
  return await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.userId, user.id))
}

export const getCount = async () => {
  const { user } = await withAuth({ ensureSignedIn: true })
  return await db
    .select()
    .from(countsTable)
    .where(eq(countsTable.userId, user.id))
}
