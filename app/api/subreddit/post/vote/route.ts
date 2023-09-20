import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { getAuthSession } from "@/lib/auth"

import { CachedPost } from "@/types/redis"
import { CATCH_AFTER_UPVOTES } from "@/config"

export async function PATCH(
  req: Request
) {
  try {

    const session = await getAuthSession()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { postId, voteType } = await req.json()
    if (!postId) return new NextResponse("PostId is missing", { status: 400 })
    if (!voteType) return new NextResponse("Vote type is missing", { status: 400 })

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      }
    })
    if (!post) return new NextResponse("Post cannot be found", { status: 404 })

    // Checking if there is a existing vote
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId
      }
    })

    if (existingVote) {
      if (existingVote.type === voteType) {
        const vote = await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id
            }
          }
        })
        return NextResponse.json(vote)
      }

      const vote = await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id
          }
        },
        data: {
          type: voteType
        }
      })

      // Recount the votes
      const votesAmt = post?.votes.reduce((acc, vote) => {
        if (vote.type === 'UP') return acc + 1
        if (vote.type === 'DOWN') return acc - 1
        return acc
      }, 0)
      if (votesAmt! >= CATCH_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          authorUsername: post?.author.username!,
          content: JSON.stringify(post?.content),
          id: post?.id!,
          title: post?.title!,
          currentVote: voteType,
          createdAt: post?.createdAt!
        }
        await redis.hset(`post:${postId}`, cachePayload)
      }

      return NextResponse.json(vote)

    }

    // If there is no existing vote
    const vote = await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId
      }
    })

    // Recounting the votes again if there is no existing vote
    const votesAmt = post?.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') return acc + 1
      if (vote.type === 'DOWN') return acc - 1
      return acc
    }, 0)
    if (votesAmt! >= CATCH_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        authorUsername: post?.author.username!,
        content: JSON.stringify(post?.content),
        id: post?.id!,
        title: post?.title!,
        currentVote: voteType,
        createdAt: post?.createdAt!
      }
      await redis.hset(`post:${postId}`, cachePayload)
    }

    return NextResponse.json(vote)

  } catch (error) {
    console.log("[SUBREDDIT_POST_VOTE_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}