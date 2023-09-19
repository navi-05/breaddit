'use client'

import { FC } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image';

const Output = dynamic(async () => (await import('editorjs-react-renderer')).default, {
  ssr: false,
})

interface EditorOutputProps {
  content: any;
}

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem'
  }
}

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer
}

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  return (
    <Output
      data={content}
      style={style}
      className="text-sm"
      renderers={renderers}
    />
)}

function CustomCodeRenderer({ data }: any) {
  return (
    <pre className='bg-gray-800 rounded-md p-4'>
      <code className='text-gray-100 text-sm'>{data.code}</code>
    </pre>
  )
}

function CustomImageRenderer({ data }: any) {
  const src = data.file.url

  return (
    <div className='relative w-full min-h-[15rem]'>
      <Image
        alt='post-image'
        src={src}
        className='object-cover'
        fill
      />
    </div>
  )
}

export default EditorOutput