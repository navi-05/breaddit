"use client";
import { VoteType } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { usePrevious } from "@mantine/hooks";
import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";

import { Button } from "@/components/ui/button";

interface CommentVotesProps {
  commentId: string;
  initialVotesAmt: number;
  initialVote?: VoteType | null
}

const CommentVotes: FC<CommentVotesProps> = ({
  commentId,
  initialVotesAmt,
  initialVote,
}) => {
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);

  const prevVote = usePrevious(currentVote);
  const { loginToast } = useCustomToast();
  

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload = {
        commentId,
        voteType,
      };

      const { data } = await axios.patch(`/api/subreddit/post/comment/vote`, payload);
      return data;
    },
    onError: (err, voteType) => {
      if(voteType === 'UP') setVotesAmt((prev) => prev - 1)
      else setVotesAmt((prev) => prev + 1)

      // reset current vote
      setCurrentVote(prevVote)

      if(err instanceof AxiosError) {
        if(err.response?.status === 401) return loginToast()
        return toast({
          title: "Something went wrong",
          description: "Your vote was not registered. Please try again later",
          variant: 'destructive'
        })
      }
    },
    onMutate: (type: VoteType) => {
      if(currentVote === type) {
        setCurrentVote(undefined)
        if(type === 'UP') setVotesAmt((prev) => prev - 1)
        else if(type === 'DOWN') setVotesAmt((prev) => prev + 1)
      } else {
        setCurrentVote(type)
        if(type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
        else if(type === 'DOWN') setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
      }
    }
  });

  return (
    <div className="flex gap-1">
      <Button onClick={() => vote("UP")} size="sm" variant="ghost" aria-label="upvote">
        <ArrowBigUp
          className={cn(
            "h-5 w-5 text-zinc-700",
            currentVote === "UP" && "text-emerald-500 fill-emerald-500"
          )}
        />
      </Button>
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>
      <Button onClick={() => vote('DOWN')} size="sm" variant="ghost" aria-label="downvote">
        <ArrowBigDown
          className={cn(
            "h-5 w-5 text-zinc-700",
            currentVote === "DOWN" && "text-rose-500 fill-rose-500"
          )}
        />
      </Button>
    </div>
  );
};

export default CommentVotes;
