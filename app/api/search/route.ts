import { NextResponse } from "next/server"

import { db } from "@/lib/db"

export async function GET(
  req: Request,
) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q')

    if(!q) return new NextResponse("Query not found", { status: 400 })

    const results = await db.subreddit.findMany({
      where: {
        name: {
          startsWith: q
        }
      },
      include: {
        _count: true,
      },
      take: 5
    })

    return NextResponse.json(results)

  } catch (error) {
    console.log("[SEARCH_GET]", error)
    return new NextResponse("Internal Servor Error", { status: 500 })
  }
}