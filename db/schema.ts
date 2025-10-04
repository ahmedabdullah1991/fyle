import { pgTable, text, integer, unique, varchar } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const usersTable = pgTable('users', {
  id: text().primaryKey(),
  email: varchar({ length: 256 }).notNull().unique(),
})

export const filesTable = pgTable('files', {
  id: text()
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text()
    .references(() => usersTable.id)
    .notNull(),
  name: text().notNull(),
  mimeType: text().notNull(),
  size: text().notNull(),
  pathname: text().notNull(),
  s3Key: text().notNull().unique(),
  s3Bucket: text().notNull(),
})

export const rootFoldersTable = pgTable(
  'rootFolders',
  {
    id: text()
      .$defaultFn(() => createId())
      .primaryKey(),
    userId: text()
      .references(() => usersTable.id)
      .notNull(),
    name: text().notNull(),
    pathname: text().notNull(),
  },
  (t) => [unique().on(t.userId, t.name)],
)

export const foldersTable = pgTable(
  'folders',
  {
    id: text()
      .$defaultFn(() => createId())
      .primaryKey(),
    userId: text()
      .references(() => usersTable.id)
      .notNull(),
    name: text().notNull(),
    parent: text().notNull(),
    pathname: text().notNull(),
  },
  (t) => [unique().on(t.userId, t.pathname)],
)

export const countsTable = pgTable('counts', {
  userId: text()
    .references(() => usersTable.id)
    .primaryKey(),
  folderCount: integer().notNull().default(4),
  fileCount: integer().notNull().default(0),
})

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert

export type File = typeof filesTable.$inferSelect
export type NewFile = typeof filesTable.$inferInsert

export type Folder = typeof foldersTable.$inferSelect
export type NewFolder = typeof foldersTable.$inferInsert

export type RootFolder = typeof rootFoldersTable.$inferSelect
export type NewRootFolder = typeof rootFoldersTable.$inferInsert

export type Count = typeof countsTable.$inferSelect
export type NewCount = typeof countsTable.$inferInsert
