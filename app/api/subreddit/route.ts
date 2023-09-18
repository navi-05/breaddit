import { NextResponse } from "next/server"

import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  req: Request
) {
  try {
   const session = await getAuthSession() 
   if(!session?.user) return new NextResponse("Unauthorized", { status: 401 })

   const { name } = await req.json()
   if(!name) return new NextResponse("Name is missing", { status: 400 })

  //  Checking for existing subreddits with same name
   const subredditExists = await db.subreddit.findFirst({
    where: {
      name
    }
   })
   if(subredditExists) return new NextResponse("Subreddit already exists", { status: 409 })

   const subreddit = await db.subreddit.create({
    data: {
      name,
      creatorId: session.user.id
    }
   })

  //  Subscribing the user to the subreddit created by them
  await db.subscription.create({
    data: {
      userId: session.user.id,
      subredditId: subreddit.id
    }
  })

  return NextResponse.json(subreddit)

  } catch (error) {
    console.log("[SUBREDDIT_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}