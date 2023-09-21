import { Comment, CommentVote, Post, Subreddit, User, Vote } from "@prisma/client"

export type ExtendedPost = Post & {
  subreddit: Subreddit,
  votes: Vote[],
  author: User,
  comments: Comment[]
}

export type PartialVote = Pick<Vote, "type">

export type ExtendedComment = Comment & {
  commentVotes: CommentVote[]
  author: User
}
