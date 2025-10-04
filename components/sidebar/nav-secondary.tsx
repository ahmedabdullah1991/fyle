'use client'

import { Count } from '@/db/schema'

import { SquareSlash } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export const NavSecondary = ({
  count,
  ...props
}: { count: Count[] } & React.ComponentPropsWithoutRef<
  typeof SidebarGroup
>) => {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent active:bg-transparent">
              <SquareSlash />
              <span className="font-medium">
                Max Folders {count[0].folderCount}/14
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent active:bg-transparent">
              <SquareSlash />
              <span className="font-medium">
                Max Files {count[0].fileCount}/10
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
