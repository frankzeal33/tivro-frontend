import Image from "next/image"
import { ReactElement } from "react"
import Link from "next/link";

export default function OnBoarding({formComponent, image}: {formComponent: ReactElement; image: string}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex gap-2 max-w-sm w-full items-center mx-auto">
          <Link href={'/'} className="flex items-center gap-2 font-medium">
              <div>
                <div className="flex items-center gap-0.5">
                  <Image src={"/next-assets/tivro.png"} width={20} height={100} className="size-5" alt="Tivro"/>
                  <h2 className="font-bold text-2xl">ivro</h2>
                </div>
              </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {formComponent}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          width={1000}
          height={1000}
          src={`/next-assets${image}`}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
