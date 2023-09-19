import { FC } from 'react'
import { notFound } from 'next/navigation'

import Sidebar from '@/components/Sidebar'

import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth'

interface LayoutProps {
  children: React.ReactNode
  params: { name: string }
}

const Layout: FC<LayoutProps> = async ({ children, params }) => {

  const session = await getAuthSession()
  const subreddit = await db.subreddit.findFirst({
    where: {
      name: params.name
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      }
    }
  })
  if(!subreddit) return notFound()

  return (
    <div className='sm:container max-w-7xl mx-auto h-full pt-12'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
        <div className='flex flex-col col-span-2 space-y-6'>          
          {children}
        </div>
        <Sidebar session={session!} subreddit={subreddit} /> 
      </div>
    </div>
)}

export default Layout