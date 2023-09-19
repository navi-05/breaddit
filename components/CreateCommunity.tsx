'use client'

import * as z from 'zod'
import { Users2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from "axios";
import { Subreddit } from '@prisma/client';
import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from "@hookform/resolvers/zod"


import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from '@/components/ui/button-loading';

import { toast } from '@/hooks/use-toast';
import { useCustomToast } from '@/hooks/use-custom-toast';

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must contain minimum of 3 characters"
  }).max(21, {
    message: "Name cannot exceed 21 characters"
  })
})

const CreateCommunity = () => {

  const router = useRouter()
  const { loginToast } = useCustomToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ''
    }
  })

  const {
    mutate: createCommunity,
    isLoading,
  } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data } = await axios.post(`/api/subreddit`, values)
      return data as Subreddit
    },
    onError: (err) => {
      if(err instanceof AxiosError) {
        if(err.response?.status === 409) {
          return toast({
            title: "Community already exists!",
            description: "Please choose a different community name.",
            variant: 'destructive'
          })
        }
        if(err.response?.status === 500) {
          return toast({
            title: "Cannot create your community at the moment",
            description: "Please try again later.",
            variant: 'destructive'
          })
        }
        if(err.response?.status === 401) {
          return loginToast()
        }
      }
      return toast({
        title: "There was an error",
        description: "Could not create community",
        variant: 'destructive'
      })
    },
    onSuccess: (data) => {
      router.push(`/r/${data.name}`)
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createCommunity(values)
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Create a community</h1>
        <Users2 />
      </div>
      <hr className="bg-zinc-500 h-px" />
      <div className="relative">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            // Enter key redirecting to '/' for no reason
            onKeyDown={(e) => {if(e.key === 'Enter') e.preventDefault()}}
            className='space-y-8'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-medium'>Name</FormLabel>
                  <FormDescription className='text-xs pb-2'>
                    Community names including capitalization cannot be changed.
                  </FormDescription>
                  <FormControl className='relative'>
                    <div>
                      <p className='absolute text-zinc-400 inset-y-0 left-0 grid place-items-center ml-2'>r/</p>
                      <Input
                        className='pl-6'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2'>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              {isLoading ? <ButtonLoading /> : (
                <Button type='submit'>
                  Create
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default CreateCommunity;
