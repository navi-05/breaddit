import { FC } from 'react'
import Image from 'next/image'
import { User } from 'next-auth'
import { AvatarProps } from '@radix-ui/react-avatar'

import { Icons } from '@/components/Icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, "name" | "image">
}

const UserAvatar: FC<UserAvatarProps> = ( { user, ...props }) => {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className='relative aspect-square h-full w-full'>
          <Image
            fill
            src={user.image}
            alt='profile-picture'
            referrerPolicy='no-referrer'
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className='sr-only'>
            {user.name}
          </span>
          <Icons.user />
        </AvatarFallback>
      )}
    </Avatar>
)}

export default UserAvatar