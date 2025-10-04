'use server'

import { Suspense } from 'react'

import { getRootFolders, getFolders } from '@/actions/drizzle'
import { Client } from './client'

const Page = async () => {
  const rootFolders = await getRootFolders()
  const subFolders = await getFolders()

  return (
    <Suspense>
      <Client rootFolders={rootFolders} subFolders={subFolders} />
    </Suspense>
  )
}

export default Page
