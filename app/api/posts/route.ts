import { NextResponse } from "next/server";
import * as z from 'zod'

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth"

export async function GET(
  req: Request
) {
  const { searchParams } = new URL(req.url)
  const session = await getAuthSession();
  if(!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  let followedCommunitiesIds: string[] = []

  if(session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        subreddit: true
      }
    })

    followedCommunitiesIds = followedCommunities.map(({ subreddit }) => subreddit.id )
  }

  try {

    const { limit, page, subredditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subredditName: z.string().nullish().optional()
      })
      .parse({
        subredditName: searchParams.get('subredditName'),
        limit: searchParams.get('limit'),
        page: searchParams.get('page')
      })

    let whereClause = {}

    if(subredditName) {
      whereClause = {
        subreddit: {
          name: subredditName
        }
      }
    } else if (session) {
      whereClause = {
        subreddit : {
          id: {
            in: followedCommunitiesIds,
          }
        }
      }
    }

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause
    })

    return NextResponse.json(posts)
    
  } catch (error) {
    console.log("[POSTS_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}