import React, { ReactElement } from 'react'

const Title = ({title, desc, children}: {title: string; desc: string, children?: ReactElement}) => {
  return (
    <div className='w-full mb-6 flex flex-col md:flex-row md:items-end gap-4 justify-between'>
        <div>
          <h1 className='text-4xl font-semibold'>{title}</h1>
          <p className='text-ring'>{desc}</p>
        </div>
        <div>
          {children}
        </div>
    </div>
  )
}

export default Title