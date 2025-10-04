'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState, useActionState, useEffect } from 'react'

import {
  IFileDelete,
  IFoldersDelete,
  IFileDownload,
  fileDelete,
  foldersDelete,
  fileDownload,
} from '@/actions/actions'

import { useSheet, SheetProvider } from '@/hooks/sheet-context'

import {
  type RootFolder as IRootFolder,
  type Folder as ISubFolder,
  type File as IFile,
  User,
  Count,
} from '@/db/schema'
import { NavUser } from './nav-user'
import { NavSecondary } from './nav-secondary'

import {
  Folder,
  ArrowLeft,
  Squircle,
  Download,
  PanelRightOpen,
  XIcon,
  CircleX,
  LoaderCircle,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { InputC } from '@/components/ui/input-copy'

export function DashboardSidebar({
  children,
  files,
  user,
  count,
  rootFolders,
  subFolders,
}: {
  children: React.ReactNode
  files: IFile[]
  user: User[]
  count: Count[]
  rootFolders: IRootFolder[]
  subFolders: ISubFolder[]
}) {
  return (
    <SidebarProvider>
      <AppSidebar
        rootFolders={rootFolders}
        subFolders={subFolders}
        user={user}
        count={count}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <BreadCrumbs rootFolders={rootFolders} subFolders={subFolders} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <FolderName rootFolders={rootFolders} subFolders={subFolders} />
          <div className="flex flex-col gap-6">
            <SheetProvider>
              <div className="flex flex-col lg:flex-row gap-6">
                <FoldersCard
                  subFolders={subFolders}
                  rootFolders={rootFolders}
                />
                {usePathname() !== '/dashboard' && <FilesCard files={files} />}
              </div>
              <FoldersFilesSheet
                rootFolders={rootFolders}
                subFolders={subFolders}
                files={files}
              />
            </SheetProvider>
            <div>{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function AppSidebar({
  rootFolders,
  subFolders,
  user,
  count,
}: {
  rootFolders: IRootFolder[]
  subFolders: ISubFolder[]
  user: User[]
  count: Count[]
}) {
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-col gap-2">
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <div className="flex flex-row gap-2">
                <Link href={'/'}>
                  <Squircle className="!size-7" />
                </Link>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <Label className="truncate font-medium">FYLE</Label>
                  <Label className="truncate text-xs">Enterprise</Label>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavigateUpOne />
        <DashList rootFolders={rootFolders} subFolders={subFolders} />
        <NavSecondary count={count} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

function DashList({
  rootFolders,
  subFolders,
}: {
  rootFolders: IRootFolder[]
  subFolders: ISubFolder[]
}) {
  const pathname = usePathname()
  const filtered = subFolders.filter(
    (element) =>
      element.pathname.substring(0, element.pathname.lastIndexOf('/')) ===
      pathname,
  )

  return (
    <>
      {pathname === '/dashboard' ? (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="font-bold">
            Root Folders
          </SidebarGroupLabel>
          <SidebarMenu>
            {rootFolders.map((value) => (
              <SidebarMenuItem key={value.name}>
                <SidebarMenuButton asChild>
                  <Link href={value.pathname}>
                    <Folder />
                    <span className="font-medium">{value.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ) : (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="font-bold">Folders</SidebarGroupLabel>
          <SidebarMenu>
            {filtered.map((value) => (
              <SidebarMenuItem key={value.name}>
                <SidebarMenuButton asChild>
                  <Link href={value.pathname}>
                    <Folder />
                    <span className="font-medium">{value.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  )
}

const NavigateUpOne = () => {
  const pathname = usePathname()
  if (pathname === '/dashboard') return null
  const basePath = pathname.substring(0, pathname.lastIndexOf('/'))

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Link
            href={basePath === '/folders' ? '/dashboard' : basePath}
            className="flex flex-row items-center gap-2"
          >
            <SidebarMenuButton>
              <ArrowLeft />
              <span>{basePath === '/folders' ? 'Dashboard' : 'Back'}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

const BreadCrumbs = ({
  rootFolders,
  subFolders,
}: {
  rootFolders: IRootFolder[]
  subFolders: ISubFolder[]
}) => {
  const pathname = usePathname()

  const breadcrumbs: { name: string; pathname: string }[] = []

  if (pathname !== '/dashboard') {
    let currentFolder: ISubFolder | undefined
    let rootfolder: IRootFolder | undefined

    const pathSegments = pathname.split('/').filter(Boolean)

    pathSegments.forEach((element, index) => {
      const currentPath = `/${pathSegments.slice(0, index + 1).join('/')}`

      if (index === 1) {
        rootfolder = rootFolders.find(
          (element) => element.pathname === currentPath,
        )

        if (rootfolder) {
          breadcrumbs.push({
            name: rootfolder.name,
            pathname: rootfolder.pathname,
          })
        }
      }

      currentFolder = subFolders.find(
        (element) => element.pathname === currentPath,
      )

      if (currentFolder) {
        breadcrumbs.push({
          name: currentFolder.name,
          pathname: currentFolder.pathname,
        })
      }
    })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathname === '/dashboard' ? (
          <BreadcrumbItem>
            <span>Dashboard</span>
          </BreadcrumbItem>
        ) : (
          <>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={index}>
                <Link href={crumb.pathname}>{crumb.name}</Link>
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </BreadcrumbItem>
            ))}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

const FolderName = ({
  rootFolders,
  subFolders,
}: {
  rootFolders: IRootFolder[]
  subFolders: ISubFolder[]
}) => {
  const pathname = usePathname()
  const isRootFolder =
    pathname.substring(0, pathname.lastIndexOf('/')) === '/folders'

  const folder = isRootFolder
    ? rootFolders.find((element) => element.pathname === pathname)
    : subFolders.find((element) => element.pathname === pathname)

  if (pathname === '/dashboard')
    return (
      <h2 className="scroll-m-20 border-b w-fit pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Dashboard
      </h2>
    )
  return (
    <h2 className="scroll-m-20 border-b w-fit pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {folder?.name}
    </h2>
  )
}

const FolderList = ({
  rootFolders,
  subFolders,
}: {
  rootFolders: IRootFolder[]
  subFolders: ISubFolder[]
}) => {
  const pathname = usePathname()

  const filtered = subFolders.filter(
    (element) =>
      element.pathname.substring(0, element.pathname.lastIndexOf('/')) ===
      pathname,
  )
  const current = pathname === '/dashboard' ? rootFolders : filtered

  const foDeIS: IFoldersDelete = {}
  const [foDeS, foDeA, foDeP] = useActionState(foldersDelete, foDeIS)
  const [foDeId, setFoDeId] = useState<string | null>(null)

  useEffect(() => {
    if (!foDeP) setFoDeId(null)
  }, [foDeP])

  if (current.length === 0) {
    return <InputC placeholder="No folders" readOnly disabled />
  }

  return (
    <div className="flex flex-col gap-2">
      {current.map((value) => (
        <div key={value.id}>
          {foDeP && foDeId === value.id ? (
            <Button variant="outline" disabled className="w-full">
              <LoaderCircle className="animate-spin" />
            </Button>
          ) : (
            <div className="w-full flex flex-row justify-between gap-2">
              <form
                id={`foDeA${value.id}`}
                action={foDeA}
                className="hidden sr-only"
              >
                <Input
                  value={value.id}
                  name="id"
                  readOnly
                  className="hidden sr-only"
                />
                <Input
                  value={value.pathname}
                  name="pathname"
                  readOnly
                  className="hidden sr-only"
                />
              </form>
              <Link href={value.pathname} className="w-full">
                <InputC placeholder={value.name} readOnly disabled />
              </Link>
              <Button
                type="submit"
                form={`foDeA${value.id}`}
                variant="destructive"
                onClick={() => setFoDeId(value.id)}
              >
                <CircleX />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const FileList = ({ files }: { files: IFile[] }) => {
  const pathname = usePathname()

  const fileDeIS: IFileDelete = {}
  const [fileDeS, fileDeA, fileDeP] = useActionState(fileDelete, fileDeIS)
  const [fileDeId, setFileDeId] = useState<string | null>(null)

  useEffect(() => {
    if (!fileDeP) setFileDeId(null)
  }, [fileDeP])

  const fileDIS: IFileDownload = {}
  const [fileDS, fileDA, fileDP] = useActionState(fileDownload, fileDIS)
  const [fileDId, setFileDId] = useState<string | null>(null)

  const [name, setName] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string | null>(null)
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    if (fileDS?.content && name && mimeType) {
      const blob = new Blob([fileDS.content], { type: mimeType! })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = name!
      link.click()
    }
  }, [fileDS?.content, name, mimeType, time])

  const current = files.filter((value) => value.pathname === pathname)

  if (current.length === 0) {
    return <InputC placeholder="No files" readOnly disabled />
  }

  return (
    <div className="flex flex-col gap-2">
      {current.map((value) => (
        <div key={value.id}>
          {(fileDP && fileDId === value.id) ||
          (fileDeP && fileDeId === value.id) ? (
            <Button variant="outline" disabled className="w-full">
              <LoaderCircle className="animate-spin" />
            </Button>
          ) : (
            <div className="w-full flex flex-row justify-between gap-2">
              <form
                id={`fileDeA${value.id}`}
                action={fileDeA}
                className="hidden sr-only"
              >
                <Input
                  id="key"
                  name="key"
                  value={value.s3Key}
                  readOnly
                  className="hidden sr-only"
                />
              </form>
              <form
                id={`fileDA${value.id}`}
                action={fileDA}
                className="hidden sr-only"
              >
                <Input
                  id="key"
                  name="key"
                  value={value.s3Key}
                  readOnly
                  className="hidden sr-only"
                />
              </form>
              <InputC placeholder={value.name} readOnly disabled />
              <Button
                type="submit"
                form={`fileDA${value.id}`}
                variant="outline"
                onClick={() => {
                  setFileDId(value.id)
                  setName(value.name)
                  setMimeType(value.name)
                  setTime(Date.now().toString())
                }}
              >
                <Download />
              </Button>
              <Button
                type="submit"
                variant="destructive"
                form={`fileDeA${value.id}`}
                onClick={() => setFileDeId(value.id)}
              >
                <CircleX />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const SheetOpenButton = () => {
  const { openSheet } = useSheet()

  return (
    <Button variant="secondary" onClick={openSheet}>
      <PanelRightOpen />
    </Button>
  )
}

const FoldersFilesSheet = ({
  rootFolders,
  subFolders,
  files,
}: {
  rootFolders: IRootFolder[]
  subFolders: ISubFolder[]
  files: IFile[]
}) => {
  const pathname = usePathname()
  const { isOpen, setIsOpen, closeSheet } = useSheet()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full max-w-sm">
        <SheetHeader className="hidden sr-only">
          <SheetTitle>Folders and Files</SheetTitle>
        </SheetHeader>
        <SheetClose asChild>
          <Button
            onClick={closeSheet}
            variant="secondary"
            className="rounded-none"
          >
            <XIcon />
          </Button>
        </SheetClose>
        <section className="px-4">
          {pathname === '/dashboard' ? (
            <FolderList rootFolders={rootFolders} subFolders={subFolders} />
          ) : (
            <div className="flex flex-col gap-2">
              <FolderList rootFolders={rootFolders} subFolders={subFolders} />
              <FileList files={files} />
            </div>
          )}
        </section>
      </SheetContent>
    </Sheet>
  )
}

const FoldersCard = ({
  rootFolders,
  subFolders,
}: {
  rootFolders: IRootFolder[]
  subFolders: ISubFolder[]
}) => {
  return (
    <Card className="w-full max-w-sm h-min">
      <CardHeader>
        <CardTitle>Folders</CardTitle>
        <CardAction>
          <SheetOpenButton />
        </CardAction>
      </CardHeader>
      <CardContent>
        <FolderList rootFolders={rootFolders} subFolders={subFolders} />
      </CardContent>
    </Card>
  )
}

const FilesCard = ({ files }: { files: IFile[] }) => {
  return (
    <Card className="w-full max-w-sm h-min">
      <CardHeader>
        <CardTitle>Files</CardTitle>
        <CardAction>
          <SheetOpenButton />
        </CardAction>
      </CardHeader>
      <CardContent>
        <FileList files={files} />
      </CardContent>
    </Card>
  )
}
