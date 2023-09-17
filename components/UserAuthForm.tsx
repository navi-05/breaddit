'use client'
import { FC, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'

import { cn } from '@/lib/utils'

import { useToast } from '@/hooks/use-toast'

import { Icons } from '@/components/Icons'
import { Button } from '@/components/ui/button'


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement>{}

const UserAuthForm: FC<UserAuthFormProps> = ({
  className, 
  ...props
}) => {

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { toast } = useToast()

  const loginWithGoogle = async () => {
    setIsLoading(true)

    try {
      await signIn('google', {
        callbackUrl: "/"
      })
      .then((callback) => {
        console.log(callback)
      })
    } catch (error) {
      toast({ 
        title: 'There was a problem',
        description: "There was a problem with google login",
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className={cn(
        "flex justify-center",
        className
      )}
      {...props}
    >
      <Button 
        onClick={loginWithGoogle} 
        disabled={isLoading} 
        size='sm' 
        className='w-full'
      >
        {!isLoading && <Icons.google className='h-4 w-4 mr-2' />}
        Google
      </Button>
    </div>
)}

export default UserAuthForm