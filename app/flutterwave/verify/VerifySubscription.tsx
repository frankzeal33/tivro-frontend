"use client"
import { axiosClient } from '@/GlobalApi'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Lottie from "lottie-react";
import paymentCheck from '@/public/next-assets/payment-check.json';
import paymentError from '@/public/next-assets/payment-error.json';

const VerifySubscription = () => {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({
    msg: '',
    status: false
  })
  const searchParams = useSearchParams()
  const transactionId = searchParams.get("transaction_id")
  const status = searchParams.get("status")

  const router = useRouter()

    useEffect(() => {
    
        const transactionId = searchParams.get("transaction_id")
        const status = searchParams.get("status")

        if (!transactionId || status !== "completed") {
             router.replace("/dashboard")
        } else {
            verifyPayment(transactionId)
        }
        
    }, [searchParams])

    const verifyPayment = async (transId: string) => {

        try {
        
            const response = await axiosClient.get(`/flutterwave/verify/?transaction_id=${transId}`)
            setMessage({
                msg: response.data?.message || "Something went wrong",
                status: true
            })

        } catch (error: any) {
            if(error.response?.data?.message === "Failed transaction {'status': 500, 'message': \"We can't verify this payment\"}"){
                setMessage({
                    msg: "Failed transaction, We can't verify this payment",
                    status: false
                })
            }else{
                setMessage({
                    msg: error.response?.data?.message || "Something went wrong",
                    status: false
                })
            }
        } finally {
            setLoading(false)
            setTimeout(() => {
                router.replace("/dashboard")
            }, 4000)
        } 
    }

  if(loading) {
    return (
        <div className="w-full flex justify-center items-center h-screen p-4">
            <div className='items-center justify-center'>
                <Loader2 className="animate-spin size-10 text-primary mx-auto" />
                <h2 className='font-bold mx-auto'>Please wait...</h2>
            </div>
        </div>
    )
  }

  return (
    <div className="w-full flex justify-center items-center h-screen p-4">
        {message.status ? (
            <div className='items-center justify-center'>
                <div className='w-[150px] h-[150px] mx-auto'>
                    <Lottie animationData={paymentCheck} loop={true} />
                </div>
                <h2 className='font-bold mx-auto text-center mb-2'>{message.msg}</h2>
                <p className='font-bold text-sm mx-auto text-center'>Redirecting to Dashboard...</p>
                <Loader2 className="animate-spin size-6 text-green-600 mx-auto" />
            </div>
        ) : (
            <div className='items-center justify-center'>
                <div className='w-[150px] h-[150px] mx-auto'>
                    <Lottie animationData={paymentError} loop={true} />
                </div>
                <h2 className='font-bold mx-auto text-center mb-2'>{message.msg}</h2>
                <p className='font-bold text-sm mx-auto text-center'>Redirecting to Dashboard...</p>
                <Loader2 className="animate-spin size-6 text-red-600 mx-auto" />
            </div>
        )}
        
    </div>
  )
}

export default VerifySubscription