import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request
) {
  try {

    const session = await getAuthSession();
    if(!session) return new NextResponse("Unauthorized", { status: 401 })

    const { name } = await req.json() 
    if(!name) return new NextResponse("Username is missing", { status: 400 })

    const username = await db.user.findFirst({
      where: {
        username: name
      }
    })
    if(username) return new NextResponse("Username taken", { status: 409 })

    const updatedUsername = await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        username: name
      }
    })
    return NextResponse.json(updatedUsername)
    
  } catch (error) {
    console.log("[USERNAME_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}