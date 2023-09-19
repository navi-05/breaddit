'use client'

import * as z from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Subreddit } from '@prisma/client'
import type EditorJS from '@editorjs/editorjs'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import TextareaAutosize from 'react-textarea-autosize'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useRef, useState } from 'react'

import { toast } from '@/hooks/use-toast'
import { uploadFiles } from '@/lib/uploadthing'


interface EditorProps {
  subreddit: Subreddit
}

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be longer than 3 characters"
  }).max(128, {
    message: "Title cannot exceed 128 characters"
  }),
  subredditId: z.string(),
  content: z.any()
})

const Editor: FC<EditorProps> = ({ subreddit }) => {

  const [isMounted, setIsMounted] = useState<boolean>(false)

  const pathName = usePathname()
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subredditId: subreddit.id,
      title: '',
      content: null,
    }
  })

  const ref = useRef<EditorJS>()
  const _titleRef = useRef<HTMLTextAreaElement>(null)

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const Embed = (await import('@editorjs/embed')).default
    const Table = (await import('@editorjs/table')).default
    const List = (await import('@editorjs/list')).default
    const Code = (await import('@editorjs/code')).default
    const LinkTool = (await import('@editorjs/link')).default
    const InlineCode = (await import('@editorjs/inline-code')).default
    const ImageTool = (await import('@editorjs/image')).default

    if(!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          ref.current = editor
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,
        data: {
          blocks: []
        },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: `/api/link`
            }
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const [res] = await uploadFiles({
                    files: [file],
                    endpoint: 'imageUploader',
                  })
                  return {
                    success: 1,
                    file: {
                      url: res?.url
                    }
                  }
                }
              }
            }
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed
        },
      })
    }
  }, [])

  
  useEffect(() => {
    if(typeof window !== undefined) {
      setIsMounted(true)
    }
  }, [])

  useEffect(() => {
    if(Object.keys(errors).length) {
      for(const [_key, value] of Object.entries(errors)) {
        toast({
          title: "Something went wrong",
          description: (value as {message: string}).message,
          variant: "destructive"
        })
      }
    }
  }, [errors])

  useEffect(() => {
    const init = async () => {
      await initializeEditor()
      setTimeout(() => {
        _titleRef.current?.focus()
      }, 0)
    }
    if(isMounted) {
      init()
      return () => {
        ref.current?.destroy()
        ref.current = undefined
      }
    }

  }, [isMounted, initializeEditor])

  const { 
    mutate: createPost
  } = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      const { data } = await axios.post(`/api/subreddit/post/create`, payload)
      return data
    },
    onError: () => {
      return toast({
        title: "Something went wrong",
        description: "Your post was not created. Please try again later",
        variant: "destructive"
      })
    },
    onSuccess: () => {
      const newPathname = pathName.split('/').slice(0, -1).join('/')
      router.push(newPathname)
      router.refresh()

      return toast({
        description: "Your post has been created successfully."
      })
    }
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const blocks = await ref.current?.save()

    const payload: z.infer<typeof formSchema> = {
      title: data.title,
      content: blocks,
      subredditId: subreddit.id
    }

    createPost(payload)

  }

  const { ref: titleRef, ...rest } = register('title')

  return (
    <div className='w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
      <form 
        id="subreddit-post-form"
        onSubmit={handleSubmit(onSubmit)}
        className='w-fit'
      >
        <div className='prose prose-stone dark:prose-invert'>
          <TextareaAutosize 
            ref={(e) => {
              titleRef(e)
              // @ts-ignore
              _titleRef.current = e
            }}
            {...rest}
            placeholder='Title' 
            className='w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none'
          />
          <div id='editor' className='min-h-[500px]' />
        </div>
      </form>
    </div>
)}

export default Editor