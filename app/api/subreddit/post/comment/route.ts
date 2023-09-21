import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function PATCH(
  req: Request
) {
  try {

    const session = await getAuthSession()
    if(!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { postId, text, replyToId } = await req.json()
    if(!postId) return new NextResponse("Post Id is missing", { status: 400 })
    if(!text) return new NextResponse("Text is missing", { status: 400 })

    const comment = await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      }
    })

    return NextResponse.json(comment)

  } catch (error) {
    console.log("[SUBREDDIT_POST_COMMENT_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}