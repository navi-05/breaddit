'use client'

import { FC } from 'react'
import { Session } from 'next-auth'
import { ImageIcon, Link2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import UserAvatar from '@/components/UserAvatar'

interface MiniCreatePostProps {
  session: Session
}

const MiniCreatePost: FC<MiniCreatePostProps> = ({ session }) => {

  const router = useRouter()
  const pathName = usePathname()

  return (
    <li className='overflow-hidden list-none rounded-md bg-white shadow'>
      <div className='h-full px-6 py-4 flex justify-between gap-6'>
        <div className="relative">
          <UserAvatar user={session?.user} />
          <span className='absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white' />
        </div>
        <Input 
          readOnly 
          onClick={() => router.push(pathName + '/submit')} 
          placeholder='Create Post'
        />
        <div className='flex items-center'>
          <Button 
            variant='ghost' 
            onClick={() => router.push(pathName + '/submit')}
          >
            <ImageIcon className='text-zinc-600' />
          </Button>
          <Button 
            variant='ghost' 
            onClick={() => router.push(pathName + '/submit')}
          >
            <Link2 className='text-zinc-600' />
          </Button>
        </div>
      </div>
    </li>
)}

export default MiniCreatePost