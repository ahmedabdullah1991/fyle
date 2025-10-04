'use client'

import React, { useActionState, useEffect, useState } from 'react'
import { rootFolderCreate, type IRootFolderCreate } from '@/actions/actions'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { SquarePen, Check, OctagonAlert, LoaderCircle } from 'lucide-react'

export default function Page() {
  const initialState: IRootFolderCreate = { success: false, message: '' }
  const [state, action, pending] = useActionState(
    rootFolderCreate,
    initialState,
  )
  const [name, setName] = useState<string>('')
  const [showMessage, setShowMessage] = useState<boolean>(false)
  const [showErrors, setShowErrors] = useState<boolean>(false)
  const [key, setKey] = useState<string>('')

  useEffect(() => {
    if (state.errors) {
      setShowErrors(true)
      const timer = setTimeout(() => {
        setShowErrors(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [state.errors, key])

  useEffect(() => {
    if (state.message) {
      setShowMessage(true)
      const timer = setTimeout(() => {
        setShowMessage(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [state.message, key])

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const afterSubmit = () => {
    setName('')
    setKey(Date.now().toString())
  }

  return (
    <Card className="w-full max-w-sm">
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
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                variant="outline"
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
