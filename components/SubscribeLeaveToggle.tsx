'use client'

import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { Subreddit } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { FC, startTransition, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonLoading } from '@/components/ui/button-loading'

import { toast } from '@/hooks/use-toast'
import { useCustomToast } from '@/hooks/use-custom-toast'

interface SubscribeLeaveToggleProps {
  subreddit: Subreddit,
  isSubscribed: boolean
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({ subreddit, isSubscribed }) => {

  const router = useRouter()
  const { loginToast } = useCustomToast()

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async(subredditId: string) => {
      const { data } = await axios.post(`/api/subreddit/subscribe`, { subredditId })
      return data
    },
    onError: (err) => {
      if(err instanceof AxiosError) {
        if(err.response?.status === 401) return loginToast()
      }
      return toast({
        title: "There was a problem",
        description: "Something went wrong, Please try again later.",
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh()
      })
      return toast({
        title: "Subscribed",
        description: `You are now subscribed to r/${subreddit.name}`
      })
    }
  })

  const { mutate: unSubscribe, isLoading: isUnSubLoading } = useMutation({
    mutationFn: async(subredditId: string) => {
      const { data } = await axios.post(`/api/subreddit/unsubscirbe`, { subredditId })
      return data
    },
    onError: (err) => {
      if(err instanceof AxiosError) {
        if(err.response?.status === 401) return loginToast()
      }
      return toast({
        title: "There was a problem",
        description: "Something went wrong, Please try again later.",
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh()
      })
      return toast({
        title: "Subscribed",
        description: `You have un-subscribed r/${subreddit.name}`
      })
    }
  })

  return (
    <>
      {isSubscribed ? (
        <>
          {isUnSubLoading ? (
            <ButtonLoading isFull />
          ) : (
            <Button 
              className='w-full mt-1 mb-4'
              disabled={isSubLoading}
              onClick={() => unSubscribe(subreddit.id)}
            >
              Leave Community
            </Button>
          )}
        </>
      ) : (
        <>
          {isSubLoading ? (
            <ButtonLoading isFull />
          ) : (
            <Button 
              className='w-full mt-1 mb-4'
              disabled={isUnSubLoading}
              onClick={() => subscribe(subreddit.id)}
            >
              Join to post
            </Button>
          )}
        </>
      )}
    </>
)}

export default SubscribeLeaveToggle