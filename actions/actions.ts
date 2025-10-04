'use server'

import { revalidatePath } from 'next/cache'

import { z } from 'zod'
import {
  filesTable,
  foldersTable,
  rootFoldersTable,
  countsTable,
  NewFile,
  NewFolder,
  NewRootFolder,
} from '@/db/schema'
import { db } from '@/db/drizzle'
import { getFiles, getFolders, getCount } from './drizzle'
import { and, eq, inArray } from 'drizzle-orm'
import { withAuth } from '@workos-inc/authkit-nextjs'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  S3ServiceException,
  NoSuchKey,
  waitUntilObjectNotExists,
} from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import chalk from 'chalk'
import 'dotenv/config'

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

export type IRootFolderCreate = {
  success: boolean
  message: string
  errors?: string
}

const ZRootFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(64, 'Name must be at most 64 characters.')
    .regex(
      /^[A-Za-z0-9 _-]+$/,
      'Name may only contain letters, numbers, hyphens and underscores.',
    ),
})

export const rootFolderCreate = async (
  prevState: IRootFolderCreate,
  formData: FormData,
) => {
  const validateFields = ZRootFolderSchema.safeParse({
    name: formData.get('name'),
  })

  if (!validateFields.success) {
    return {
      success: false,
      message: '',
      errors: z.prettifyError(validateFields.error),
    }
  }

  try {
    const { user } = await withAuth({ ensureSignedIn: true })

    const count = await getCount()

    if (count[0].folderCount >= 14) {
      console.log(chalk.red(' Max folder count reached'))
      return {
        success: false,
        message: 'Max folder count reached.',
        errors: undefined,
      }
    }

    const folderValues: NewRootFolder = {
      name: validateFields.data.name,
      pathname: `/folders/` + validateFields.data.name.replaceAll(' ', '%20'),
      userId: user.id,
    }

    await db.insert(rootFoldersTable).values(folderValues)
    await db.update(countsTable).set({ folderCount: count[0].folderCount + 1 })
    console.log(chalk.hex('#0FFFFF')(' New root folder inserted to neon'))
    console.log(chalk.hex('#0FFFFF')(' Folder count updated in neon'))

    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Your folder has been created!`,
      errors: undefined,
    }
  } catch (error) {
    console.error(chalk.red(' Error inserting root folder to neon'), error)
    return {
      success: false,
      message: 'An error occurred.',
      errors: undefined,
    }
  }
}

export type IFolderCreate = {
  success: boolean
  message: string
  errors?: string
}

const ZFolderCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(64, 'Name must be at most 64 characters.')
    .regex(
      /^[A-Za-z0-9 _-]+$/,
      'Name may only contain letters, numbers, hyphens and underscores.',
    ),
  parent: z.string(),
  pathname: z.string(),
})

export const folderCreate = async (
  prevState: IFolderCreate,
  formData: FormData,
) => {
  const validateFields = ZFolderCreateSchema.safeParse({
    name: formData.get('name'),
    parent: formData.get('parent'),
    pathname: formData.get('pathname'),
  })

  if (!validateFields.success) {
    return {
      success: false,
      message: '',
      errors: z.prettifyError(validateFields.error),
    }
  }

  try {
    const { user } = await withAuth({ ensureSignedIn: true })

    const count = await getCount()

    if (count[0].folderCount >= 14) {
      console.log(chalk.red(' Max folder count reached'))
      return {
        success: false,
        message: 'Max folder count reached.',
        errors: undefined,
      }
    }

    const folderValues: NewFolder = {
      name: validateFields.data.name,
      parent: validateFields.data.parent,
      pathname:
        validateFields.data.pathname +
        `/` +
        validateFields.data.name.replaceAll(' ', '%20'),
      userId: user.id,
    }

    await db.insert(foldersTable).values(folderValues)
    await db.update(countsTable).set({ folderCount: count[0].folderCount + 1 })
    console.log(chalk.hex('#0FFFFF')(' New folder inserted to neon'))
    console.log(chalk.hex('#0FFFFF')(' Folder count updated in neon'))

    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Your folder has been created!`,
      errors: undefined,
    }
  } catch (error) {
    console.error(chalk.red(' Error inserting folder to neon'), error)
    return {
      success: false,
      message: 'An error occurred.',
      errors: undefined,
    }
  }
}

export type IFoldersDelete =
  | {
      errors?: string
    }
  | undefined

const ZFoldersDeleteSchema = z.object({
  id: z.string(),
  pathname: z.string(),
})

export const foldersDelete = async (
  prevState: IFoldersDelete,
  formData: FormData,
) => {
  const client = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
  })

  const validatedFields = ZFoldersDeleteSchema.safeParse({
    id: formData.get('id'),
    pathname: formData.get('pathname'),
  })

  if (!validatedFields.success) {
    return {
      errors: z.prettifyError(validatedFields.error),
    }
  }

  let pathname: string
  if (
    validatedFields.data.pathname.substring(
      0,
      validatedFields.data.pathname.lastIndexOf('/'),
    ) === '/folders'
  ) {
    pathname = 'root'
  } else {
    pathname = 'sub'
  }

  const folders = await getFolders()
  const files = await getFiles()

  const folderIds: string[] = []
  const folderPaths: string[] = []

  if (pathname === 'sub') {
    folderIds.push(validatedFields.data.id)
    folderPaths.push(validatedFields.data.pathname)
  }
  buildArray(validatedFields.data.pathname)

  function buildArray(pathname: string) {
    for (const folder of folders) {
      if (
        folder.pathname.substring(0, folder.pathname.lastIndexOf('/')) ===
        pathname
      ) {
        folderIds.push(folder.id)
        folderPaths.push(folder.pathname)
        buildArray(folder.pathname)
      }
    }
  }

  const filesFiltered = files.filter(
    (value) =>
      value.pathname === validatedFields.data.pathname ||
      folderPaths.includes(value.pathname),
  )

  const command = new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: filesFiltered.map((k) => ({ Key: k.s3Key })),
    },
  })

  for (const key in filesFiltered) {
    await waitUntilObjectNotExists(
      { client, maxWaitTime: 60 },
      { Bucket: BUCKET_NAME, Key: key },
    )
  }

  try {
    const { user } = await withAuth({ ensureSignedIn: true })

    if (pathname === 'root') {
      await db
        .delete(rootFoldersTable)
        .where(
          and(
            eq(rootFoldersTable.userId, user.id),
            eq(rootFoldersTable.id, validatedFields.data.id),
          ),
        )
    }
    if (folderIds.length !== 0) {
      await db
        .delete(foldersTable)
        .where(
          and(
            eq(foldersTable.userId, user.id),
            inArray(foldersTable.id, folderIds),
          ),
        )
    }
    if (filesFiltered.length !== 0) {
      await db.delete(filesTable).where(
        and(
          eq(filesTable.userId, user.id),
          inArray(
            filesTable.pathname,
            filesFiltered.map((value) => value.pathname),
          ),
        ),
      )
    }
    if (filesFiltered.length !== 0) {
      await client.send(command)
    }

    console.log(chalk.hex('#0FFFFF')(` Folder and files deleted from neon`))
    console.log(chalk.hex('#0FFFFF')(` Files deleted from S3`))
  } catch (error) {
    console.log(chalk.red(' An error has occurred'))
    console.error(chalk.red(' ' + error))
  }

  revalidatePath('/dashboard')
}

export type IFileUpload = {
  success: boolean
  message: string
  errors?: string
}

const ZFileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file instanceof File, {
      message: 'File must be a valid File object.',
    })
    .refine(
      (file) => {
        const allowedTypes = ['text/plain', 'application/pdf']
        return allowedTypes.includes(file.type)
      },
      {
        message: 'Only TXT and PDF files are allowed.',
      },
    )
    .refine((file) => file.size <= 2 * 1024 * 102, {
      message: 'File size must be less than 2MB.',
    }),
  pathname: z.string(),
})

export const fileUpload = async (
  prevState: IFileUpload,
  formData: FormData,
) => {
  const file = formData.get('file') as File
  const pathname = formData.get('pathname') as string

  const fileValidation = ZFileUploadSchema.safeParse({
    file: file,
    pathname: pathname,
  })

  if (!fileValidation.success) {
    return {
      success: false,
      message: '',
      errors: z.prettifyError(fileValidation.error),
    }
  }

  const fileExtension = file.name.split('.').pop()
  const key = `${uuidv4()}-${Date.now()}.${fileExtension}`

  try {
    const client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-2',
      credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    })

    const { user } = await withAuth({ ensureSignedIn: true })

    const count = await getCount()

    if (count[0].fileCount >= 10) {
      console.log(chalk.hex('#0FFFFF')(' Max file count reached'))
      return {
        success: false,
        message: 'Max file count reached.',
        errors: undefined,
      }
    }

    const bytes = await fileValidation.data.file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await client.send(command)

    const fileInsert: NewFile = {
      userId: user.id,
      name: file.name,
      mimeType: file.type,
      size: file.size.toString(),
      pathname: pathname,
      s3Key: key,
      s3Bucket: BUCKET_NAME!,
    }

    await db.insert(filesTable).values(fileInsert)
    await db.update(countsTable).set({ fileCount: count[0].fileCount + 1 })

    console.log(chalk.hex('#0FFFFF')(' File metadata inserted to neon'))
    console.log(chalk.hex('#0FFFFF')(' File uploaded to S3'))

    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Your file has been uploaded!`,
      errors: undefined,
    }
  } catch (error) {
    console.error(` Error from S3/neon while uploading file.`, error)
    return {
      success: false,
      message: 'An error occurred.',
      errors: undefined,
    }
  }
}

export type IFileDelete =
  | {
      errors?: string
    }
  | undefined

const ZFileDeleteSchema = z.object({
  key: z.string(),
})

export const fileDelete = async (
  prevState: IFileDelete,
  formData: FormData,
) => {
  const client = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
  })

  const validateFields = ZFileDeleteSchema.safeParse({
    key: formData.get('key'),
  })

  if (!validateFields.success) {
    return {
      errors: z.prettifyError(validateFields.error),
    }
  }

  try {
    const { user } = await withAuth({ ensureSignedIn: true })
    await db
      .delete(filesTable)
      .where(
        and(
          eq(filesTable.userId, user.id),
          eq(filesTable.s3Key, validateFields.data.key),
        ),
      )

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: validateFields.data.key,
    })

    await client.send(command)
    await waitUntilObjectNotExists(
      { client, maxWaitTime: 60 },
      { Bucket: BUCKET_NAME, Key: validateFields.data.key },
    )

    console.log(chalk.hex('#0FFFFF')(' File metadata deleted from neon'))
    console.log(
      chalk.hex('#0FFFFF')(` Object deleted from S3, or it doesn't exist`),
    )
  } catch (error) {
    if (error instanceof S3ServiceException && error.name === 'NoSuchBucket') {
      console.error(
        chalk.red(
          ` Error from S3 while deleting the object. The object doesn't exist`,
        ),
      )
    } else if (error instanceof S3ServiceException) {
      console.error(
        chalk.red(
          ` Error from S3 while deleting the object. ${error.name}: ${error.message}`,
        ),
      )
    } else {
      console.error(chalk.red(' Error deleting object from S3'), error)
    }
  }

  revalidatePath('/dashboard')
}

export type IFileDownload =
  | {
      errors?: string
      content?: string
    }
  | undefined

const ZFileDownloadSchema = z.object({
  key: z.string(),
})

export const fileDownload = async (
  prevState: IFileDownload,
  formData: FormData,
): Promise<IFileDownload> => {
  const client = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
  })

  const validateFields = ZFileDownloadSchema.safeParse({
    key: formData.get('key'),
  })

  if (!validateFields.success) {
    return {
      errors: z.prettifyError(validateFields.error),
    }
  }

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: validateFields.data.key,
      }),
    )

    if (response.Body) {
      const str = await response.Body.transformToString()
      return { content: str }
    } else {
      return
    }
  } catch (error) {
    if (error instanceof NoSuchKey) {
      console.error(
        ` Error from S3 while getting the object. No such key exists`,
      )
    } else if (error instanceof S3ServiceException) {
      console.error(` Error from S3 while getting the object`)
    } else {
      throw error
    }
  }
}
