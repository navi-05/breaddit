'use client'

import { FC } from 'react'
import Link from 'next/link'
import { User } from 'next-auth'
import { signOut } from 'next-auth/react'

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import UserAvatar from '@/components/UserAvatar'

interface UserAccountNavProps {
  user: Pick<User, 'name' | 'image' | 'email'>
}

const UserAccountNav: FC<UserAccountNavProps> = ({ user }) => {

  const onSignOut = (e: Event) => {
    e.preventDefault()
    signOut({
      callbackUrl: `${window.location.origin}/sign-in`
    })
  }

  return (
    <DropdownMenu>

      <DropdownMenuTrigger>
        <UserAvatar 
          user={user}  
          className='h-8 w-8'
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className='bg-white' align='end'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-1 leading-none'>
            {user.name && <p className='font-medium'>{user.name}</p>}
            {user.email && <p className='w-[200px] truncate text-sm text-zinc-700'>{user.email}</p>}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/">
            Feed
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/r/create">
            Create Community
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={(e) => onSignOut(e)} className='cursor-pointer'>
          Sign out
        </DropdownMenuItem>

      </DropdownMenuContent>
      
    </DropdownMenu>
)}

export default UserAccountNav