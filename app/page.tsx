import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { Squircle, GitCommit, HardDrive, Share2, Shield } from 'lucide-react'

import { Main } from './client'

const Page = () => {
  return (
    <>
      <Navbar />
      <Main />
      <CardSection />
      <Footer />
    </>
  )
}

export default Page

const Navbar = () => {
  return (
    <nav>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 border-l border-b border-r rounded-md">
        <div className="flex items-center gap-3">
          <Squircle size={32} />
          <span className="text-xl font-semibold text-foreground hidden sm:block">
            FYLE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="https://github.com/ahmedabdullah1991/fyle">
            <Button variant="outline">
              <GitCommit />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-blue-700 hover:bg-blue-600 text-white font-semibold">
              DASHBOARD
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

const features = [
  {
    index: 1,
    icon: HardDrive,
    headline: 'Unlimited Storage',
    description:
      'Upload, organize documents, and files with no restrictions, with seamless data management.',
  },
  {
    index: 2,
    icon: Share2,
    headline: 'Secure Sharing',
    description:
      'Send files securely via links, controlling access and permissions for full privacy and safety.',
  },
  {
    index: 3,
    icon: Shield,
    headline: 'Enterprise Security',
    description:
      'Ensure encrypted storage, secure protocols, and compliance-ready infrastructure.',
  },
]

const CardSection = () => {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 2xl:px-0 mt-16 sm:mt-32">
        <div className="flex flex-col gap-8">
          <div className="max-w-md flex flex-col gap-2">
            <p className="text-blue-700 font-bold">UPLOAD. ORGANIZE. ACCESS</p>
            <p className="text-4xl font-bold">
              Experience that grows with scale
              <span className="text-blue-700">_</span>
            </p>
            <p className="text-muted-foreground">
              FYLE is a modern file management web application built with
              Next.js and powered by AWS. It enables users to create folders and
              upload files.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {features.map((value) => (
              <Card key={value.index} className="bg-card/15 rounded-none py-16">
                <CardContent>
                  <div>
                    <div className="flex flex-row gap-2">
                      <value.icon className="text-blue-700" />
                      <p className="text-xl font-semibold">{value.headline}</p>
                    </div>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const Footer = () => {
  return (
    <footer>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 mt-16 sm:mt-32 border-t border-l border-r rounded-md">
        <div className="flex items-center gap-3">
          <Squircle size={32} />
          <span className="text-xl font-semibold text-foreground hidden sm:block">
            FYLE
          </span>
        </div>

        <div className={'flex items-center gap-3'}>
          <p className="font-bold">Star on Github</p>
          <Link href="https://github.com/ahmedabdullah1991/fyle">
            <Button variant="outline">
              <GitCommit />
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  )
}
