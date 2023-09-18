import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function POST(
  req: Request
) {
  try {
    const session = await getAuthSession()    
    if(!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { subredditId } = await req.json() 
    if(!subredditId) return new NextResponse('Subreddit ID is misssing', { status: 400 })

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session?.user?.id
      }
    })
    if(subscriptionExists) return new NextResponse("Subscription already exists", { status: 400 })

    const subscription = await db.subscription.create({
      data: {
        subredditId,
        userId: session?.user?.id
      }
    })
    return NextResponse.json(subscription)

  } catch (error) {
    console.log("[SUBREDDIT_SUBSCRIBE_POST]", error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}