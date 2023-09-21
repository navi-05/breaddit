

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

import PostComment from "@/components/PostComment"
import CreateComment from "@/components/CreateComment"

interface CommentSectionProps {
  postId: string
}

const CommentSection = async ({
  postId
}: CommentSectionProps) => {

  const session = await getAuthSession()

  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null
    },
    include: {
      author: true,
      commentVotes: true,
      replies: {
        include: {
          author: true,
          commentVotes: true
        }
      }
    }
  })

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      <CreateComment postId={postId} replyToId='' />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {

            const topLevelCommentVotesAmt = topLevelComment.commentVotes.reduce((acc, vote) => {
              if(vote.type === "UP") return acc + 1
              if(vote.type === 'DOWN') return acc - 1
              return acc
            }, 0)

            const topLevelCommentVote = topLevelComment.commentVotes.find((vote) => vote.userId === session?.user.id)

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment 
                    comment={topLevelComment} 
                    currentVote={topLevelCommentVote?.type!} 
                    votesAmt={topLevelCommentVotesAmt}
                    postId={postId}
                  />
                </div>
                
                {/* Replies render */}
                {topLevelComment.replies
                  .sort((a, b) => b.commentVotes.length - a.commentVotes.length)
                  .map((reply) => {

                    const replyCommentVotesAmt = reply.commentVotes.reduce((acc, vote) => {
                      if(vote.type === "UP") return acc + 1
                      if(vote.type === 'DOWN') return acc - 1
                      return acc
                    }, 0)
        
                    const replyCommentVote = reply.commentVotes.find((vote) => vote.userId === session?.user.id)        

                    return (
                      <div key={reply.id} className="ml-2 py-2 pl-4 border-l-2 border-zinc-200">
                        <PostComment
                          comment={reply}
                          currentVote={replyCommentVote?.type!}
                          votesAmt={replyCommentVotesAmt}
                          postId={postId}
                        />
                      </div>
                    )
                  })
                }

              </div>
            )
        })}
      </div>

    </div>
)}

export default CommentSection