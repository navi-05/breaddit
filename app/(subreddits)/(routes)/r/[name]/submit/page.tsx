import { notFound } from "next/navigation"

import Editor from "@/components/Editor"
import { Button } from "@/components/ui/button"

import { db } from "@/lib/db"

interface pageProps {
  params: {
    name: string
  }
}

const page = async ({ params }: pageProps) => {

  const subreddit = await db.subreddit.findFirst({
    where: {
      name: params.name
    }
  })
  if(!subreddit) return notFound()

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">Create Post</h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">in r/{params.name}</p>
        </div>
      </div>

      {/* Form */}
      <Editor subreddit={subreddit} />

      
    </div>
  )
}

export default page