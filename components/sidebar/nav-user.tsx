'use client'

import { useTheme } from 'next-themes'
import { signOutFunction } from '@/actions/signout'

import { type User } from '@/db/schema'

import { ChevronsUpDown, LogOut, Moon, Sun, Monitor } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function NavUser({ user }: { user: User[] }) {
  const { isMobile } = useSidebar()
  const { setTheme } = useTheme()

  const email = user[0].email.split('@')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:border-border data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={''} alt={''} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{email[0]}</span>
                <span className="truncate text-xs">{''}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={''} alt={''} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{email[0]}</span>
                  <span className="truncate text-xs">@{email[1]}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Tabs defaultValue="system">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="dark" onClick={() => setTheme('dark')}>
                    <Moon />
                  </TabsTrigger>
                  <TabsTrigger value="light" onClick={() => setTheme('light')}>
                    <Sun />
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOutFunction()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
