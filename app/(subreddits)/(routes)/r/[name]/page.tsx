import { notFound } from "next/navigation"

import PostFeed from "@/components/PostFeed"
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
        orderBy: {
          createdAt: 'desc'
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS
      }
    }
  })
  if(!subreddit) return notFound()

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        r/{subreddit.name}
      </h1>

      <MiniCreatePost session={session!} />
      <PostFeed 
        initialPosts={subreddit.posts}
        subredditName={subreddit.name}
      />
    </>
  )
}

export default page