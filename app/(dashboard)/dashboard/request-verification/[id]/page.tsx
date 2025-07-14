"use client"
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { BsFillLightningChargeFill } from 'react-icons/bs'
import {
    Card,
    CardContent,
  } from "@/components/ui/card"
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import Image from 'next/image'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Status } from '@/components/Status'
import { useParams, useRouter } from 'next/navigation'
import { axiosClient } from '@/GlobalApi'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import Skeleton from '@/components/Skeleton'
import SkeletonFull from '@/components/SkeletonFull'

const Page = () => {

    const params = useParams();
    const id = params?.id;
    const [loadingInfo, setLoadingInfo] = useState(false)
    const [resending, setResending] = useState(false)
    const [verification, setVerification] = useState<any>()
     const arrayList = new Array(2).fill(null)
     const router = useRouter()

    const getVerification = async () => {
        
        try {
    
          setLoadingInfo(true)
          
          const response = await axiosClient.get(`/verifications/item/?id=${id}`)
          setVerification(response.data || {})
    
        } catch (error: any) {
          toast.error(error.response?.data?.message);
        } finally {
          setLoadingInfo(false)
        } 
    }

    useEffect(() => {
        getVerification()
    }, [id])

    const resendVerification  = async () => {
        try {
    
          setResending(true)
          
          const response = await axiosClient.post(`/resend/verification/link/`, { request_id: verification?.Bio_data?.request_id})
          toast.success(response.data?.email_sent)
          toast.success(response.data?.sms_sent)
    
        } catch (error: any) {
          toast.error(error.response?.data?.detail);
        } finally {
          setResending(false)
        } 
    }
    
  return (
    <div className='my-container'>
        {loadingInfo ? (
            <div className="grid grid-col-1 gap-6 mt-4">
                <Skeleton />
                {arrayList.map((_, index) => (
                    <SkeletonFull key={index} />
                ))}
            </div>
        ) : (
             <div className='space-y-4'>
                <div  className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
                    <div>
                        <button onClick={() => router.back()} className="text-sm mb-6 flex gap-1 items-center">
                            <ArrowLeft size={16} className="text-normal"/>
                            Back
                        </button>
                        <h2 className='font-bold text-2xl'>Issued certificate</h2>
                        <p className='text-muted-foreground'>{verification?.Bio_data?.["created date"] ? format(new Date(verification?.Bio_data?.["created date"]), "dd MMM yyyy, hh:mm a") : "N/A"}</p>
                    </div>
                    <Button loading={resending} disabled={resending} className='w-fit' onClick={resendVerification}>
                        {resending ? "Resending..." : "Resend Request"}
                    </Button>
                </div>

                <div className='bg-light p-4 rounded-2xl border space-y-4'>
                    <Card className='shadow-none p-4'>
                        <CardContent>               
                            <div className='flex flex-col gap-4 items-center justify-center'>
                                <Avatar className='size-32'>
                                    <AvatarImage src={'/next-assets/photo.png'} alt="TV" />
                                    <AvatarFallback className='text-4xl'>{`${verification?.Bio_data?.first_name[0] ?? ''}${verification?.Bio_data?.last_name[0] ?? ''}`.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col items-center gap-2'>
                                    <p className="text-2xl font-medium leading-none">{verification?.Bio_data?.first_name} {verification?.Bio_data?.last_name}</p>
                                    <div className='flex items-center flex-wrap justify-center gap-1'>
                                        <p className="text-base text-center text-muted-foreground">Certificate of verification presented by</p>
                                        <div className="flex items-center">
                                            <Image src={'/next-assets/tivro.png'} width={16} height={20} alt=""/>
                                            <h2 className="font-bold text-base">ivro</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='shadow-none'>
                        <CardContent>               
                            <div>
                                <div className='grid md:grid-cols-2 gap-4'>
                                    <div>
                                        <p className="text-sm font-medium leading-none">First name</p>
                                        <p className="text-sm text-muted-foreground">{verification?.Bio_data?.first_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">Last name</p>
                                        <p className="text-sm text-muted-foreground">{verification?.Bio_data?.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">Email</p>
                                        <p className="text-sm text-muted-foreground">{verification?.Bio_data?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">Phone No</p>
                                        <p className="text-sm text-muted-foreground">{verification?.Bio_data?.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">Address</p>
                                        <p className="text-sm text-muted-foreground">{verification?.Bio_data?.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">Date issued</p>
                                        <p className="text-sm text-muted-foreground">{verification?.Bio_data?.["created date"] ? format(new Date(verification?.Bio_data?.["created date"]), "dd MMM yyyy, hh:mm a") : "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className='bg-light p-4 rounded-2xl border space-y-4'>
                    <div className='flex items-center gap-2 mb-6'>
                        <p className="text-xl font-medium leading-none">Verification Status</p>
                        <Status status={verification?.status?.status}/>
                    </div>

                    <div>
                        <Accordion type="multiple" className="w-full space-y-6" defaultValue={["item-1", "item-2", "item-3"]}>
                            <AccordionItem value="item-1" className='border rounded-2xl px-6'>
                                <AccordionTrigger className='border-b rounded-none hover:no-underline'>
                                    <div className='flex items-center gap-2'>
                                        <p className="text-lg font-medium leading-none">Identity check</p>
                                        <Status status={verification?.identity_verification?.Identity_check} otherStyles='text-sm'/>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className='space-y-2 py-4'>
                                        <div className='md:flex gap-2 items-center justify-between'>
                                            <p className="text-sm text-muted-foreground">Identification method</p>
                                            <p className="text-sm font-medium leading-none">Bank verification number (BVN)</p>
                                        </div>
                                        <div className='md:flex gap-2 items-center justify-between'>
                                            <p className="text-sm text-muted-foreground">Identification number</p>
                                            <p className="text-sm font-medium leading-none">{verification?.identity_verification?.bvn_number ? verification?.identity_verification?.bvn_number : "N/A"}</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className='border rounded-2xl px-6'>
                                <AccordionTrigger className='border-b rounded-none hover:no-underline'>
                                    <div className='flex items-center gap-2'>
                                        <p className="text-lg font-medium leading-none">Credit check</p>
                                        <Status status={verification?.credit_check?.credit_score} otherStyles='text-sm'/>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className='space-y-2 py-4'>
                                        <div className='md:flex gap-2 items-center justify-between'>
                                            <p className="text-sm text-muted-foreground">No data indicating  non-payment.</p>
                                        </div>
                                        <div className='md:flex gap-2 items-center justify-between'>
                                            <p className="text-sm text-muted-foreground">Databases analysed:</p>
                                            <p className="text-sm font-bold leading-none">Credit Information Bureau</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className='border rounded-2xl px-6'>
                                <AccordionTrigger className='border-b rounded-none hover:no-underline'>
                                    <div className='flex items-center gap-2'>
                                        <p className="text-lg font-medium leading-none">Employment check</p>
                                        <Status status={verification?.work_place?.work_place_status} otherStyles='text-sm'/>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className='space-y-2 py-4'>
                                        <div className='md:flex gap-2 items-center justify-between'>
                                            <p className="text-sm text-muted-foreground">Line Manager Check</p>
                                            <p className="text-sm font-medium leading-none">{verification?.work_place?.line_manager_check}</p>
                                        </div>
                                        <div className='md:flex gap-2 items-center justify-between'>
                                            <p className="text-sm text-muted-foreground">Identification Card and Income check</p>
                                            <p className="text-sm font-medium leading-none">{verification?.work_place?.line_manager_check}</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default Page