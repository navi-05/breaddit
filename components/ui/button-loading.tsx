import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

export function ButtonLoading({ isFull }: { isFull ?: boolean}) {
  return (
    <Button disabled className={cn(isFull && "w-full")}>
      <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
      Please wait
    </Button>
  )
}
