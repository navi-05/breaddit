"use client";

import axios from "axios";
import { VoteType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FC, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";

import { ExtendedComment } from "@/types/db";
import { formatTimeToNow } from "@/lib/utils";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import CommentVotes from "@/components/CommentVotes";
import { Textarea } from "@/components/ui/textarea";
import { ButtonLoading } from "@/components/ui/button-loading";
import { toast } from "@/hooks/use-toast";

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: VoteType;
  postId: string;
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  votesAmt,
  currentVote,
  postId,
}) => {

  const [isReplying, setIsReplying] = useState<boolean>(false)
  const [commentInput, setCommentInput] = useState<string>('')

  const commentRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { data: session } = useSession()

  const { mutate: replyToComment, isLoading } = useMutation({
    mutationFn: async ({
      postId,
      text,
      replyToId,
    }: {
      postId: string;
      text: string;
      replyToId?: string;
    }) => {
      const payload = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment`,
        payload
      );
      return data;
    },
    onError: (err) => {
      return toast({
        title: "Something went wrong",
        description: "Comment was not posted. Please try again later"
      })
    },
    onSuccess: () => {
      router.refresh()
      setCommentInput('')
      setIsReplying(false)
    }
  })

  return (
    <div className="flex flex-col" ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex flex-wrap gap-2 items-center mt-2">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote}
        />

        <Button onClick={() => {
          if(!session) return router.push('/sign-in')
          setIsReplying(true)
        }} variant='ghost' size='sm' aria-label="Reply">
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>

        {isReplying && (
          <div className="grid w-full gap-1.5">
          <Label htmlFor="comment">Your comment</Label>
          <div className="mt-2">
            <Textarea
              id="comment"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              rows={1}
              placeholder="What are your thoughts?"
            />
            <div className="mt-2 flex gap-2 justify-end">
              <Button tabIndex={-1} variant='outline' onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              {isLoading ?
              <ButtonLoading />
              : 
                <Button disabled={commentInput.length === 0} onClick={() => replyToComment({
                  postId,
                  text: commentInput,
                  replyToId: comment.replyToId ?? comment.id
                })}>
                  Post
                </Button>
              }
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default PostComment;
