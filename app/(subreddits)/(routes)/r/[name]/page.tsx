import { notFound } from "next/navigation"

import Sidebar from "@/components/Sidebar"
import MiniCreatePost from "@/components/MiniCreatePost"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config"

interface pageProps {
  params: { 
    name: string
  }
}

const page = async ({ params }: pageProps) => {

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
          comments: true,
          subreddit: true
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS
      }
    }
  })
  if(!subreddit) return notFound()

  return (
    <div className='sm:container max-w-7xl mx-auto h-full pt-12'>
      {/* TODO: Button to take us back */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
        <div className='flex flex-col col-span-2 space-y-6'>

          <h1 className="font-bold text-3xl md:text-4xl h-14">
            r/{subreddit.name}
          </h1>

          <MiniCreatePost session={session!} />
          {/* TODO: Show posts */}  

        </div>

        <Sidebar session={session!} subreddit={subreddit} /> 
      </div>
  </div>
  )
}

export default page