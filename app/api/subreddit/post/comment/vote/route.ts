import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export async function PATCH(
  req: Request
) {
  try {

    const session = await getAuthSession()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { commentId, voteType } = await req.json()
    if (!commentId) return new NextResponse("CommentId is missing", { status: 400 })
    if (!voteType) return new NextResponse("Vote type is missing", { status: 400 })

    // Checking if there is a existing vote
    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId
      }
    })

    if (existingVote) {
      if (existingVote.type === voteType) {
        const vote = await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id
            }
          }
        })
        return NextResponse.json(vote)
      }

      const vote = await db.commentVote.update({
        where: {
          userId_commentId: {
            commentId,
            userId: session.user.id
          }
        },
        data: {
          type: voteType
        }
      })


      return NextResponse.json(vote)

    }

    // If there is no existing vote
    const vote = await db.commentVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        commentId
      }
    })

    
    return NextResponse.json(vote)

  } catch (error) {
    console.log("[SUBREDDIT_POST_COMMENT_VOTE_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}