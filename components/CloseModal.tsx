'use client'

import { X } from "lucide-react"
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"

const CloseModal = () => {

  const router = useRouter()

  return (
    <Button 
      variant="outline" 
      className="h-6 w-6 p-0 rounded-md" 
      aria-label="close-modal"
      onClick={() => router.back()}
    >
      <X className="h-4 w-4" />
    </Button>
)}

export default CloseModal