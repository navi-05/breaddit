import axios from "axios"
import { NextResponse } from "next/server"
import { json } from "node:stream/consumers"

export async function GET(
  req: Request
) {
  const { searchParams } = new URL(req.url)
  const href = searchParams.get('url')

  if(!href) return new NextResponse("Invalid href", { status: 400 })

  const res = await axios.get(href)

  const titleMatch = res.data.match(/<title>(.*?)<\/title>/)
  const title = titleMatch ? titleMatch[1] : ''

  const descriptionMatch = res.data.match(/<meta name="description" content="(.*?)"/)
  const description = descriptionMatch ? descriptionMatch[1] : ''

  const imageMatch = res.data.match(/<meta property="og:image" content="(.*?)"/)
  const imageUrl = imageMatch ? imageMatch[1] : ''

  return new Response(
    JSON.stringify({
      success: 1,
      meta: {
        title,
        description,
        image: {
          url: imageUrl
        }
      }
    })
  )
}