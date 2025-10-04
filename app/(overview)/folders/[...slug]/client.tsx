'use client'

import { redirect, usePathname } from 'next/navigation'
import {
  ChangeEvent,
  useActionState,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react'

import {
  folderCreate,
  fileUpload,
  IFolderCreate,
  IFileUpload,
} from '@/actions/actions'
import type {
  Folder as ISubFolder,
  RootFolder as IRootFolder,
} from '@/db/schema'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { InputC } from '@/components/ui/input-copy'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

import {
  SquarePen,
  UploadIcon,
  X,
  SquareMousePointer,
  Check,
  OctagonAlert,
  LoaderCircle,
} from 'lucide-react'

export const Client = ({
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

  if (!folder) {
    return redirect('/dashboard')
  } else {
    return (
      <div className="flex flex-wrap flex-row gap-6">
        <FolderCreate />
        <FileUpload />
      </div>
    )
  }
}

export function FolderCreate() {
  const pathname = usePathname()

  const initialState: IFolderCreate = { success: false, message: '' }
  const [state, action, pending] = useActionState(folderCreate, initialState)

  const [name, setName] = useState<string>('')
  const [showMessage, setShowMessage] = useState<boolean>(false)
  const [showErrors, setShowErrors] = useState<boolean>(false)
  const [errorKey, setErrorKey] = useState<string>('')

  useEffect(() => {
    if (state.errors) {
      setShowErrors(true)
      const timer = setTimeout(() => {
        setShowErrors(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [state.errors, errorKey])

  useEffect(() => {
    if (state.message) {
      setShowMessage(true)
      const timer = setTimeout(() => {
        setShowMessage(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [state.message, errorKey])

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const afterSubmit = () => {
    setName('')
    setErrorKey(Date.now().toString())
  }

  return (
    <Card className="w-full max-w-sm h-min">
      <CardHeader>
        <CardTitle>New Folder</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} onSubmit={afterSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name" className="font-bold">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={handleNameChange}
                required
              />
            </div>
            <Input
              id="parent"
              name="parent"
              type="hidden"
              value={pathname.substring(pathname.lastIndexOf('/') + 1)}
              required
            />
            <Input
              id="pathname"
              name="pathname"
              value={pathname}
              type="hidden"
              required
            />
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={pending ? true : false}
              >
                {pending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <>{<SquarePen />} Create</>
                )}
              </Button>
              {state.errors && showErrors && (
                <Alert variant="default" className="border-red-500">
                  <OctagonAlert />
                  <AlertDescription>
                    {state?.errors?.split(' →')[0].replace('✖ ', '').trim()}
                  </AlertDescription>
                </Alert>
              )}
              {state.message && showMessage && (
                <Alert
                  className={
                    state.success ? 'border-teal-500' : 'border-red-500'
                  }
                >
                  {state.success ? <Check /> : <OctagonAlert />}
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const FileUpload = () => {
  const pathname = usePathname()

  const MAX_SIZE = 2 * 1024 * 1024
  const [file, setFile] = useState<File>()
  const initialState: IFileUpload = { success: false, message: '' }
  const [state, action, pending] = useActionState(fileUpload, initialState)

  const [showMessage, setShowMessage] = useState<boolean>(false)
  const [showErrors, setShowErrors] = useState<boolean>(false)
  const [errorKey, setErrorKey] = useState<string>('')

  useEffect(() => {
    if (state.errors) {
      setShowErrors(true)
      const timer = setTimeout(() => {
        setShowErrors(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [state.errors, errorKey])

  useEffect(() => {
    if (state.message) {
      setShowMessage(true)
      const timer = setTimeout(() => {
        setShowMessage(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [state.message, errorKey])

  const refInput = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0]

      if (file.size > MAX_SIZE) {
        setFile(undefined)
      } else {
        setFile(file)
      }
    }
  }

  const handleOpenFileDialog = useCallback(() => {
    if (refInput.current) {
      refInput.current.click()
    }
  }, [])

  const handleFileClear = () => {
    setFile(undefined)
    if (refInput.current) {
      refInput.current.value = ''
    }
  }

  return (
    <>
      <Card className="w-full max-w-sm h-min">
        <CardHeader>
          <CardTitle>Select File</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="myForm"
            action={action}
            onSubmit={() => {
              setFile(undefined)
              setErrorKey(Date.now().toString())
            }}
          >
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                onClick={handleOpenFileDialog}
                variant="secondary"
              >
                <SquareMousePointer />
                Select
                <Input
                  id="file"
                  name="file"
                  type="file"
                  className="hidden sr-only"
                  ref={refInput}
                  onChange={handleFileChange}
                  accept=".txt, .pdf"
                />
                <Input
                  id="pathname"
                  name="pathname"
                  defaultValue={pathname}
                  className="hidden sr-only"
                />
              </Button>
              {!file && !pending && (
                <Label className="text-muted-foreground w-full text-center">
                  TXT and PDF files less than 2MB
                </Label>
              )}
              {file && (
                <div className="flex flex-row gap-2 items-center">
                  <InputC placeholder={file.name} readOnly disabled />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={handleFileClear}
                  >
                    <X />
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        {file && (
          <CardFooter>
            <Button
              type="submit"
              variant="secondary"
              form="myForm"
              className="w-full"
            >
              <UploadIcon />
              Upload
            </Button>
          </CardFooter>
        )}
        {pending && (
          <CardFooter>
            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              disabled={pending ? true : false}
            >
              <LoaderCircle className="animate-spin" />
            </Button>
          </CardFooter>
        )}
        {state.errors && showErrors && (
          <CardFooter>
            <Alert variant="default" className="border-red-500">
              <OctagonAlert />
              <AlertDescription>
                {state?.errors?.split(' →')[0].replace('✖ ', '').trim()}
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
        {state.message && showMessage && (
          <CardFooter>
            <Alert
              className={state.success ? 'border-teal-500' : 'border-red-500'}
            >
              {state.success ? <Check /> : <OctagonAlert />}
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>
    </>
  )
}
