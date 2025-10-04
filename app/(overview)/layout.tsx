'use server'

import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import {
  getUser,
  getRootFolders,
  getFolders,
  getFiles,
  getCount,
} from '@/actions/drizzle'
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components'

import { DashboardSidebar } from '@/components/sidebar/dash-sidebar'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getUser()
  const rootFolders = await getRootFolders()
  const subFolders = await getFolders()
  const files = await getFiles()
  const user = await getUser()
  const count = await getCount()

  if (currentUser.length === 0) {
    return redirect('/callback')
  }

  return (
    <Suspense>
      <DashboardSidebar
        files={files}
        user={user}
        count={count}
        rootFolders={rootFolders}
        subFolders={subFolders}
      >
        <AuthKitProvider>
          <main>{children}</main>
        </AuthKitProvider>
      </DashboardSidebar>
    </Suspense>
  )
}
