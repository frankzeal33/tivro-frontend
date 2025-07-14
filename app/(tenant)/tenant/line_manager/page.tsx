"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Avatar,
  AvatarImage,
} from "@/components/ui/avatar"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useCallback, useEffect, useState } from "react"
import { axiosClient } from "@/GlobalApi"
import { toast } from "react-toastify"
import { useTenantStore } from "@/store/TenantStore"


const Page = () => {

  const router = useRouter()
  const searchParams = useSearchParams()
  const verify_token = searchParams.get("verify_token")
  const token = searchParams.get("token")
  const names = searchParams.get("names")

  const [loadingYes, setLoadingYes] = useState(false) 
  const [loadingNo, setLoadingNo] = useState(false) 

  useEffect(() => {
    if (!token || !verify_token || !names) {
      router.replace("/")
    }
  }, [token, verify_token])

  const handleSubmit = async (option: string) => {

    try {
    
      if(option === "yes"){
        setLoadingYes(true)
      }else{
        setLoadingNo(true)
      }
      
      const response = await axiosClient.post(`/line_manager/?verify_token=${verify_token}&token=${token}&answer=${option}`)

      toast.success(response.data?.message)

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      if(option === "yes"){
        setLoadingYes(false)
      }else{
        setLoadingNo(false)
      }
    } 

  }
  
  return (
    <div className="tenant-container -mt-[4.5rem] lg:mt-0">
        <div className={cn("flex flex-col gap-6 items-center justify-center")}>
          <Card className="shadow-none max-w-96 p-0">
            <CardHeader className="text-center px-4 pt-4">
              <Avatar className='size-16 mx-auto'>
                  <AvatarImage src={'/next-assets/photo.png'} alt="Tenant" />
              </Avatar>
              <CardTitle className="text-lg">Line Manager Verification</CardTitle>
              <CardDescription>
                Confirm that you are the line manager of the tenant below.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-2">
              <CardDescription className="text-center font-medium text-xl text-secondary-foreground">
                {names && `${names.split("_")[0]} ${names.split("_")[1]}`}
              </CardDescription>
            </CardContent>
            <CardFooter className="flex gap-5 p-4 border-t items-center justify-center">
              <Button loading={loadingYes} disabled={loadingYes || loadingNo} type="button" onClick={() => handleSubmit("yes")}>
                {loadingYes ? "" : "Yes"}
              </Button>
              <Button loading={loadingNo} disabled={loadingNo || loadingYes} type="button" onClick={() => handleSubmit("no")}>
                {loadingNo ? "" : "No"}
              </Button>
            </CardFooter>
          </Card>
      </div>
    </div>
  )
}

export default Page