"use client"
import { axiosClient } from '@/GlobalApi'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Lottie from "lottie-react";
import paymentCheck from '@/public/next-assets/payment-check.json';
import paymentError from '@/public/next-assets/payment-error.json';
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { useTenantStore } from '@/store/TenantStore'

const VerifyTenantPayment = () => {
  const [loading, setLoading] = useState(true)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [message, setMessage] = useState({
    msg: '',
    status: false
  })
  const searchParams = useSearchParams()
  
  const tenantInfo = useTenantStore((state) => state.tenantInfo)
//   const hasVerified = useRef(false)

  const router = useRouter()


    // Redirect if no orderId
    useEffect(() => {
        const orderId = searchParams.get("orderId")

        if (!orderId) {
            router.replace("/")
        }else{
            // if (hasVerified.current) return;
            // hasVerified.current = true;
            verifyPayment(orderId)
        }
    }, [searchParams])

    const verifyPayment = async (order_Id: string) => {

        try {
        
            const response = await axiosClient.get(`/ten/verifyPayment/?order_id=${order_Id}`)
            setMessage({
                msg: response.data?.message || "Something went wrong",
                status: true
            })

        } catch (error: any) {
            setMessage({
                msg: error.response?.data?.message || "Something went wrong",
                status: false
            })
        } finally {
            setLoading(false)
        } 
    }

    const pay = async (): Promise<void> =>  {
        try{
          setLoadingPayment(true)
    
          const response = await axiosClient.post(`/apartment/verification/consent/?token=${tenantInfo?.user_token}&consent=yes`)
    
          const data = {
            amount: 10,
            token: tenantInfo?.user_token
          }
          const result = await axiosClient.post("/payment/tenant/", data)
          const paymentLink = result.data?.payment?.link;
    
          if (paymentLink) {
            window.location.href = paymentLink;
          } else {
            toast.error("No payment link received");
          }
    
        } catch (error: any) {
          toast.error(error.response?.data?.detail);
        } finally {
        //   setLoadingPayment(false)
        }
      }

  if(loading) {
    return (
        <div className="w-full flex justify-center items-center h-[80vh] p-4">
            <div className='items-center justify-center'>
                <Loader2 className="animate-spin size-10 text-primary mx-auto" />
                <h2 className='font-bold mx-auto'>Please wait...</h2>
            </div>
        </div>
    )
  }

  return (
    <div className="w-full flex justify-center items-center h-[80vh] p-4">
        {message.status ? (
            <div className='items-center justify-center'>
                <div className='w-[150px] h-[150px] mx-auto'>
                    <Lottie animationData={paymentCheck} loop={true} />
                </div>
                <h2 className='font-bold mx-auto text-center mb-2'>{message.msg}</h2>
                <div className='items-center justify-center'>
                    <h2 className='font-bold mx-auto text-center mb-2 text-lg'>You’ve come to the end</h2>
                    <p className='font-bold text-sm mx-auto text-center'>Congratulations, you have completed this verification.</p>
                    <p className='font-bold text-sm mx-auto text-center'>You will receive a mail from us soon.</p>
                </div>
            </div>
        ) : (
            <div className='items-center justify-center'>
                <div className='w-[150px] h-[150px] mx-auto'>
                    <Lottie animationData={paymentError} loop={true} />
                </div>
                <h2 className='font-bold mx-auto text-center mb-2'>{message.msg}</h2>
                {message.msg !== "We have previously processed this payment" && (
                    <div className='flex items-center justify-center'>
                        <Button type="button" onClick={pay} loading={loadingPayment} disabled={loadingPayment}>{loadingPayment ? "Loading..." : "Retry Payment"}</Button>
                    </div>
                )}
            </div>
        )}
        
    </div>
  )
}

export default VerifyTenantPayment