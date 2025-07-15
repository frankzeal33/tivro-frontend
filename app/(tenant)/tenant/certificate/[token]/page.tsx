"use client"
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
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
import { useParams } from 'next/navigation'
import { axiosClient } from '@/GlobalApi'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import Skeleton from '@/components/Skeleton'
import SkeletonFull from '@/components/SkeletonFull'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DownloadStatus } from '@/components/DownloadStatus'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const Page = () => {

    const params = useParams();
    const token = params?.token;
    const [loadingInfo, setLoadingInfo] = useState(false)
    const [resending, setResending] = useState(false)
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [verification, setVerification] = useState<any>()
     const arrayList = new Array(2).fill(null)

    const getCert = async () => {
        
        try {
    
          setLoadingInfo(true)
          
          const response = await axiosClient.get(`/cert/tenant/?token=${token}`)
          setVerification(response.data || {})
    
        } catch (error: any) {
          toast.error(error.response?.data?.message);
        } finally {
          setLoadingInfo(false)
        } 
    }

    useEffect(() => {
        getCert()
    }, [token])

    const resend = async () => {
        try {
        
            setResending(true)
            
            const response = await axiosClient.post(`/resend/line_manager/email/?token=${token}`,)
            toast.success(response.data?.message)

        } catch (error: any) {
            toast.error(error.response?.data?.message);
        } finally {
            setResending(false)
        } 
    }

    const generatePdf = () => {
        const input = document.getElementById('certificate') as HTMLElement | null;
        if (!input) return;

        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            const timestamp = Date.now();
            pdf.save(`${verification?.bio_data?.first_name}-${verification?.bio_data?.last_name}-${timestamp}.pdf`);

        });
    };

  return (
    <div className='my-container -mt-[4rem] lg:mt-6'>
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
                        <h2 className='font-bold text-2xl'>Issued certificate</h2>
                        <p className='text-muted-foreground'>{verification?.bio_data?.created_date ? format(new Date(verification?.bio_data?.created_date), "dd MMM yyyy, hh:mm a") : "N/A"}</p>
                        <AlertDialog open={open} onOpenChange={setOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant={'outline'} className='bg-light'>Resend Email to Line Manager</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[400px] gap-0 max-h-[95%] overflow-y-auto">
                                <form>
                                    <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                        <AlertDialogTitle className="text-sm">Confirm Email</AlertDialogTitle>
                                        <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                                    </AlertDialogHeader>
                                    <AlertDialogDescription className="w-full bg-light px-4 py-4 flex flex-col items-center justify-center gap-3">
                                        <span className='grid gap-2 w-full'>
                                            <Label htmlFor="email" className='text-accent-foreground'>Line Manager Email address</Label>
                                            <Input id="email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="Enter here" />
                                        </span>
                                        
                                    </AlertDialogDescription>
                                    <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                                        <Button loading={resending} disabled={resending} type="button" className='w-full' onClick={resend}>
                                           {resending ? "Resending..." : "Resend"}
                                        </Button>
                                    </AlertDialogFooter>
                                </form>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <Button className='w-fit' onClick={generatePdf}>
                        <BsFillLightningChargeFill size={26} className="text-primary-foreground"/>
                        Download
                    </Button>
                </div>

                <div id="certificate" className='space-y-4'>
                    <div className='bg-light p-4 rounded-2xl border space-y-4'>
                        <Card className='shadow-none p-4'>
                            <CardContent>               
                                <div className='flex flex-col gap-4 items-center justify-center'>
                                    <Avatar className='size-32'>
                                        <AvatarImage src={'/next-assets/photo.png'} alt="TV" />
                                        <AvatarFallback className='text-4xl'>{`${verification?.bio_data?.first_name[0] ?? ''}${verification?.bio_data?.last_name[0] ?? ''}`.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col items-center gap-2'>
                                        <p className="text-2xl font-medium leading-none text-center">{verification?.bio_data?.first_name} {verification?.bio_data?.last_name}</p>
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
                                            <p className="text-sm text-muted-foreground">{verification?.bio_data?.first_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">Last name</p>
                                            <p className="text-sm text-muted-foreground">{verification?.bio_data?.last_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">Email</p>
                                            <p className="text-sm text-muted-foreground">{verification?.bio_data?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">Phone No</p>
                                            <p className="text-sm text-muted-foreground">{verification?.bio_data?.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">Address</p>
                                            <p className="text-sm text-muted-foreground">{verification?.bio_data?.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">Date issued</p>
                                            <p className="text-sm text-muted-foreground">{verification?.bio_data?.created_date ? format(new Date(verification?.bio_data?.created_date), "dd MMM yyyy, hh:mm a") : "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className='bg-light p-4 rounded-2xl border space-y-4'>
                        <div className='flex items-center gap-2 mb-6'>
                            <p className="text-xl font-medium leading-none">Verification Status</p>
                            <DownloadStatus status={verification?.status?.status}/>
                        </div>

                        <div>
                            <Accordion type="multiple" className="w-full space-y-6" defaultValue={["item-1", "item-2", "item-3"]}>
                                <AccordionItem value="item-1" className='border rounded-2xl px-6'>
                                    <AccordionTrigger className='border-b rounded-none hover:no-underline'>
                                        <div className='flex items-center gap-2'>
                                            <p className="text-lg font-medium leading-none">Identity check</p>
                                            <DownloadStatus status={verification?.identity_verification?.identity_check} otherStyles='text-sm'/>
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
                                            <DownloadStatus status={verification?.credit_check?.credit_score} otherStyles='text-sm'/>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className='space-y-2 py-4'>
                                            <div className='md:flex gap-2 items-center justify-between'>
                                                <p className="text-sm text-muted-foreground">{verification?.credit_check?.credit_review}</p>
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
                                            <DownloadStatus status={verification?.work_place?.work_place_status} otherStyles='text-sm'/>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className='space-y-2 py-4'>
                                            <div className='md:flex gap-2 items-center justify-between'>
                                                <p className="text-sm text-muted-foreground">Line Manager Check</p>
                                                <p className="text-sm font-medium leading-none">{verification?.work_place?.line_manager_check}</p>
                                            </div>
                                            <div className='md:flex gap-2 items-center justify-between'>
                                                <p className="text-sm text-muted-foreground">Work Place Status</p>
                                                <p className="text-sm font-medium leading-none">{verification?.work_place?.work_place_status}</p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
        
            </div>
        )}
    </div>
  )
}

export default Page