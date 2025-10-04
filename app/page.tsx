'use server'

import Image from 'next/image'
import Link from 'next/link'
import adminDashboardDesktop from '@/public/admin-dash-desktop.png'
import adminDashboardMobile from '@/public/admin-dash-mobile.png'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

import {
  Circle,
  HardDrive,
  Share2,
  Users,
  Smartphone,
  ShieldCheck,
  Star,
} from 'lucide-react'

const features = [
  {
    index: 1,
    icon: HardDrive,
    headline: 'Unlimited Storage',
    tagline: 'Never run out of space.',
    description:
      'Upload and organize all your files without limits, including documents, photos, and high-resolution videos.',
  },
  {
    index: 2,
    icon: Share2,
    headline: 'Secure Sharing',
    tagline: 'Share with confidence.',
    description:
      'Send files with secure links, full permission control, access levels, and expiration dates for safety.',
  },
  {
    index: 3,
    icon: Users,
    headline: 'Collaboration',
    tagline: 'Work together, instantly.',
    description:
      'Edit, comment, and collaborate on files with your team in real time without version confusion.',
  },
  {
    index: 4,
    icon: Smartphone,
    headline: 'Cross-device access',
    tagline: 'Your files, everywhere.',
    description:
      'Access and sync your files across desktop, mobile, and web. Work anytime, anywhere—even offline.',
  },
  {
    index: 5,
    icon: ShieldCheck,
    headline: 'Enterprise security',
    tagline: 'Protection you can trust.',
    description:
      'Encryption at rest and in transit with compliance-ready infrastructure ensures personal and business files remain safe.',
  },
]

const Page = () => {
  return (
    <>
      <style>{`@media (max-width: 299px) {.label-hide {display: none}}`}</style>
      <header>
        <div className="w-full max-w-7xl flex flex-row justify-between items-center mx-auto px-4 py-2">
          <div className="flex flex-row gap-2">
            <Circle className="!size-7" />
            <Label className="label-hide text-xl font-bold tracking-widest">
              FYLE
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Link href={'/dashboard'}>
              <Button>DASHBOARD</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="w-full max-w-7xl h-13 mx-auto px-4 py-2 flex justify-center border-border border-b">
        <Label className="text-center">
          Star the project on github
          <Star className="size-5" strokeWidth={1} />
        </Label>
      </main>
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] max-w-7xl mx-auto gap-20 lg:gap-2 justify-items-center lg:justify-items-start items-center px-4 py-20 lg:py-40">
        <div className="w-full grid grid-cols-1 justify-items-start">
          <h1 className="scroll-m-20 text-left text-4xl tracking-tighter font-extrabold text-balance">
            Seamless File Storage
          </h1>
          <Label className="w-2/3 sm:w-1/2 lg:w-2/3 text-foreground/50 text-left">
            Your all-in-one platform to store, share, and collaborate on
            files—anytime, anywhere, on any device.
          </Label>
        </div>
        <Image
          src={adminDashboardDesktop}
          alt="admin dashboard dasktop screenshot"
          className="rounded-lg object-cover hidden lg:block"
          quality={20}
          placeholder="blur"
        />
        <Image
          src={adminDashboardMobile}
          alt="admin dashboard mobile screenshot"
          className="rounded-lg object-cover block lg:hidden"
          quality={20}
          placeholder="blur"
        />
      </section>
      <section className="w-full max-w-7xl mx-auto pb-20 lg:pb-40 px-4">
        <Card className="p-0 bg-gradient-to-br from-foreground/20 to-transparent px">
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            {features.map((value) => (
              <Card key={value.index} className="bg-transparent shadow-none">
                <CardContent className="flex flex-row gap-6">
                  {<value.icon className="!size-20" />}
                  <div>
                    <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
                      {value.headline}
                    </h1>
                    <Label className="text-muted-foreground">
                      {value.description}
                    </Label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  )
}

export default Page
