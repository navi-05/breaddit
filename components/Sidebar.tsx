import Link from "next/link";
import { format } from "date-fns";
import { Session } from "next-auth";
import { Subreddit } from "@prisma/client";

import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import { buttonVariants } from "@/components/ui/button";

import { db } from "@/lib/db";

interface SidebarProps {
  session: Session;
  subreddit: Subreddit;
}

const Sidebar = async ({ subreddit, session }: SidebarProps) => {

  const memberCount = await db.subscription.count({
    where: {
      subreddit: {
        name: subreddit.name,
      },
    },
  }); 
  const subscription = !session?.user ? undefined : await db.subscription.findFirst({
    where: {
      subreddit: {
        name: subreddit.name
      },
      user: {
        id: session.user.id
      }
    }
  })
  const isSubscribed = !!subscription


  return (
    <div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
      <div className="px-6 py-4">
        <p className="font-semibold py-3">About r/{subreddit.name}</p>
      </div>
      <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Created</dt>
          <dd className="text-gray-700">
            <time dateTime={subreddit.createdAt.toDateString()}>
              {format(subreddit.createdAt, "MMMM d, yyyy")}
            </time>
          </dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Members</dt>
          <dd className="text-gray-700">
            <p className="text-gray-900">{memberCount}</p>
          </dd>
        </div>
        {subreddit.creatorId === session?.user?.id ? (
          <div className="flex justify-between gap-x-4 py-3">
            <p className="text-gray-500">You created this community</p>
          </div>
        ) : (
          <SubscribeLeaveToggle subreddit={subreddit} isSubscribed={isSubscribed} />
        )}
        {session?.user && (
          <Link 
            href={`/r/${subreddit.name}/submit`}
            className={buttonVariants({ variant: "outline", className: 'w-full mb-6' })}
          >
            Create Post
          </Link>
        )}
      </dl>
    </div>
  );
};

export default Sidebar;
