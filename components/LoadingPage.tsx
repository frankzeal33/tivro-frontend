import Image from 'next/image'
import React from 'react'

const LoadingPage = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="flex items-center">
            <Image src={"/next-assets/tivro.png"} width={30} height={70} className="size-6" alt="Tivro"/>
            <h2 className="font-bold text-2xl">IVRO</h2>
        </div>
        <p className="text-sm text-bold mt-4">Loading...</p>
    </div>
  )
}

export default LoadingPage