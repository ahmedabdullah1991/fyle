'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'

import { Orbitron } from 'next/font/google'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

import dashDesktop from '@/public/admin-dash-desktop.png'
import dashDesktopLight from '@/public/admin-dash-desktop-light.png'
import dashMobile from '@/public/admin-dash-mobile.png'
import dashMobileLight from '@/public/admin-dash-mobile-light.png'

const orbitron = Orbitron({
  subsets: ['latin'],
})

export const Main = () => {
  const { theme } = useTheme()

  return (
    <main>
      <div className="w-full mx-auto max-w-7xl flex flex-col items-center gap-16 mt-16 sm:mt-32">
        <div className="w-full max-w-sm flex flex-col gap-2 px-4 sm:px-0">
          <Button
            variant="outline"
            className="text-white text-xs sm:text-sm w-max bg-gradient-to-br from-background via-blue-700 to-blue-500 rounded-full"
          >
            <Sparkles /> | New integrations, new experiences
          </Button>
          <div>
            <h1
              className={`${orbitron.className} text-blue-700 text-7xl font-extrabold tracking-widest`}
            >
              FYLE
            </h1>
            <p className="text-muted-foreground font-bold ml-1">
              SEAMLESS FILE STORAGE
              <br />
              STORE. SHARE. COLLABORATE
            </p>
          </div>
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="default"
                className="bg-blue-700 hover:bg-blue-600 text-white w-full"
              >
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
        <div>
          <Image
            src={theme === 'dark' || 'system' ? dashDesktop : dashDesktopLight}
            alt=""
            height={512}
            className="hidden sm:block"
          />
          <Image
            src={theme === 'dark' || 'system' ? dashMobile : dashMobileLight}
            alt=""
            className="block sm:hidden"
          />
        </div>
      </div>
    </main>
  )
}
