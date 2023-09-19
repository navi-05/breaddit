import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function POST(
  req: Request
) {
  try {
    const session = await getAuthSession()    
    if(!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { subredditId, title, content } = await req.json() 
    if(!subredditId) return new NextResponse('Subreddit ID is misssing', { status: 400 })
    if(!title) return new NextResponse('Title is misssing', { status: 400 })
    if(!content) return new NextResponse('Content is misssing', { status: 400 })

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session?.user?.id
      }
    })
    if(!subscriptionExists) return new NextResponse("Subscribe to post", { status: 400 })

    const post = await db.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        subredditId,
      }
    })

    return NextResponse.json(post)

  } catch (error) {
    console.log("[SUBREDDIT_POST_CREATE]", error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}