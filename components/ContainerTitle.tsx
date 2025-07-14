import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

export const ContainerTitle = ({title, desc, goBack}: {title: string; desc: string; goBack?: string}) => {
  return (
    <div  className='flex items-end justify-between gap-2'>
        <div>
            {goBack && 
              <Link href={goBack} className="text-sm mb-6 flex gap-1 items-center">
              <ArrowLeft size={16} className="text-normal"/>
                Back
            </Link>
            }
            <h2 className='font-bold text-2xl'>{title}</h2>
            <p className='text-muted-foreground'>{desc}</p>
        </div>
    </div>
  )
}
