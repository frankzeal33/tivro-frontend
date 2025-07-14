"use client"
import {
  CardContent,
} from "@/components/ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import FormCardHeader from "./FormCardHeader"
import { Label } from "../ui/label"
import FormCardFooter from "./FormCardFooter"
import { useGlobalContext } from "@/context/GlobalContext"
import { FormEvent, useState } from "react"
import { axiosClient } from "@/GlobalApi"
import { toast } from "react-toastify"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { useTenantStore } from "@/store/TenantStore"

const otpSchema = z.object({
  pin: z.string().min(6, "PIN must be 6 digits"),
})

const  CreditCheck = () => {

    const {
      setCurrentSection,
      otp,
      employmentInfo,
      formProgress,
      setFormProgress,
      setEmploymentInfo,
      setOtp,
      apartmentInspection,
      setApartmentInspection,
      requestDetails,
      setRequestDetails,
      identityCheck,
      setIdentityCheck
    } = useGlobalContext();
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pin, setPin] = useState("")
    const [loadingOTPResend,  setLoadingOTPResend] = useState(false)
    const tenantInfo = useTenantStore((state) => state.tenantInfo)
  
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const result = otpSchema.safeParse({ pin })
                    
      if (!result.success) {
        const message = result.error.formErrors.fieldErrors.pin?.[0] || "Invalid input"
        toast.error(message)
        return
      }

      try {
      
        setIsSubmitting(true)

        const data = {
          otp: pin,
          token: tenantInfo?.user_token
        }
        
        const result = await axiosClient.post(`/credit_check/otp/`, data)

         if(result.status === 200){
            toast.success(result.data?.data || result.data?.message?.data);

            setOtp("")
            setCurrentSection("employment-check")
            setFormProgress({...formProgress, fraction: "4/6",  percent: 68})
            setOtp({...otp, completed: true,  iscurrentForm: false})
            setEmploymentInfo({...employmentInfo,  iscurrentForm: true})

          }else if(result.status === 201){
            toast.success(result.data?.message);

            setCurrentSection("verify-apartment")
            setFormProgress({...formProgress, fraction: "5/6",  percent: 90})
            setEmploymentInfo({...employmentInfo, completed: true,  iscurrentForm: false})
            setApartmentInspection({...apartmentInspection, iscurrentForm: true})

          }else{
            toast.error(result.data?.message);
            setCurrentSection("Identity check")
            setFormProgress({...formProgress, fraction: "2/6",  percent: 34})
            setRequestDetails({...requestDetails, completed: true,  iscurrentForm: false})
            setIdentityCheck({...identityCheck,  iscurrentForm: true})
          }

      } catch (error: any) {
        toast.error(error.response?.data?.detail || error.response?.data?.message);
      } finally {
        setIsSubmitting(false)
      } 
    }

    const resendOTP = async () => {
      try {
  
        setLoadingOTPResend(true)
        
        const response = await axiosClient.post("/resend/creditscore/otp/", {token: tenantInfo?.user_token})
        if(response.data?.status === 200 && response.data?.message === "successful"){
          toast.success("Another OTP has been sent to your BVN-Linked Phone No.");
          setOtp("")
        }else{
          toast.error(response?.data?.message);
        }
        
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoadingOTPResend(false)
      } 
    }

return (
  <div className="shadow-none max-w-96">
          <FormCardHeader title="OTP verification" desc="An OTP has been sent to your BVN linked phone number. Kindly enter it below to proceed."/>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <CardContent className="px-4 py-2">
                  <div className="grid gap-1">
                    <div className='grid gap-3'>
                        <div className="grid gap-2">
                            <Label htmlFor="otp">Enter OTP*</Label>
                            <Input id="otp" type="number" placeholder="123456" value={pin} onChange={(e) => setPin(e.target.value)} />
                            {/* <p className="text-xs text-negative">Invalid code. Try again!</p> */}
                        </div>
                    </div>
                    <div className="text-sm flex items-center gap-1 mt-2">
                      Didn’t receive a code?{" "}
                      {loadingOTPResend ? (
                        <Loader2 className="animate-spin size-5 text-primary" />
                      ) : (
                        <Button type="button" onClick={resendOTP} className="p-0 text-primary" variant={'link'}>
                          Resend
                        </Button>
                      )}
                    </div>    
                  </div>
              </CardContent>
              <FormCardFooter text="Proceed" loading={isSubmitting}/>
          </form>
        </div>
)
}

export default CreditCheck