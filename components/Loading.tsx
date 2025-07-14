import { Loader2 } from 'lucide-react'
import React from 'react'

export const Loading = () => {
  return (
    <div className="w-full flex justify-center items-center min-h-44">
      <Loader2 className="animate-spin size-10 text-primary" />
    </div>
  )
}
