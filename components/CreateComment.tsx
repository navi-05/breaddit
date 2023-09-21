"use client";

import { FC, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { ButtonLoading } from "./ui/button-loading";

interface CreateCommentProps {
  postId: string
  replyToId?: string
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const [commentInput, setCommentInput] = useState<string>("");

  const router = useRouter();
  const { loginToast } = useCustomToast();

  const { mutate: createComment, isLoading } = useMutation({
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
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
      }
      return toast({
        title: "There was a problem",
        description: "Something went wrong, Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setCommentInput("");
    },
  });

  return (
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
        <div className="mt-2 flex justify-end">
        {isLoading ?
         <ButtonLoading />
        : 
          <Button onClick={() => createComment({
            postId,
            text: commentInput,
            replyToId
          })}>
            Post
          </Button>
        }
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
