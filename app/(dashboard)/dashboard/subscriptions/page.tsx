"use client"
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, ChevronsUpDown, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { BsFillLightningChargeFill } from 'react-icons/bs'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
  import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from '@/components/ui/separator'
import { ContainerTitle } from '@/components/ContainerTitle'
import { cn } from '@/lib/utils'
import NotFound from '@/components/NotFound'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { format } from 'date-fns'
import { SubscriptionStatus } from '@/components/SubscriptionStatus'
import displayCurrency from '@/utils/displayCurrency'
import { Loading } from '@/components/Loading'
import Skeleton from '@/components/Skeleton'
import TableSkeleton from '@/components/TableSkeleton'
import Image from 'next/image'
import { HiBadgeCheck } from 'react-icons/hi'
import { FaCircleCheck } from 'react-icons/fa6'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const subStatus = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "initiate",
      label: "Initiate",
    },
    {
      value: "successful",
      label: "Successful",
    },
    {
      value: "failed",
      label: "Failed",
    }
  ]

type planType = {
    Number_of_verification: number;
    status: string;
    plan: string;
    date: string;
    amount: number
}

type historyType = {
    payment_gateway: string;
    plan: string;
    status: string;
    amount: number;
    created_at: string;
}[]

type overviewType = {
  Number_of_verification: number;
  Total_verification_requested: number;
  completed_verification: number;
  plan: string
  status: string
}

type plansType = {
  title: string,
  description: string,
  verifications_provided: number,
  price: string,
  // features: string[];
}

const Page = () => {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [loadingSubscription, setLoadingSubscription] = useState(false)
    const [loadingPlan, setLoadingPlan] = useState(false)
    const [subscriptionPlan, setSubscriptionPlan] = useState<planType>()
    const [subHistory, setSubHistory] = useState<historyType>([])
    const [formerSubHistory, setFormerSubHistory] = useState<historyType>([])
    const arrayList = new Array(1).fill(null)
    const tableList = new Array(6).fill(null)
    const [subData, setSubData] = useState<overviewType>({
        Number_of_verification: 0,
        Total_verification_requested: 0,
        completed_verification: 0,
        status: "",
        plan: ""
    })
    const [choosenSub, setChoosenSub] = useState<Partial<plansType>>({})
    const [openSubModal, setOpenSubModal] = useState(false);
    const [couponCode, setCouponCode] = useState("")
    const [showCouponInput, setShowCouponInput] = useState(false)
    const [loadingPlans, setLoadingPlans] = useState(false)
    const [submittingPayment, setSubmittingPayment] = useState(false)
    const [plansData, setPlansData] = useState<plansType[]>([])

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [count, setCount] = useState(0)


    const getPlan = async () => {
    
        try {
        
            setLoadingPlan(true)
            
            const [planRes, subRes] = await Promise.all([
                axiosClient.get("/user/subscription/plans/"),
                axiosClient.get("/dashboard/")
            ])

            setSubscriptionPlan(planRes.data || {})
            setSubData(subRes.data || {})
    
        } catch (error: any) {
            toast.error(error.response?.data?.message);
        } finally {
            setLoadingPlan(false)
        } 
    }

    const getSubscription = async () => {
    
        try {
        
            setLoadingSubscription(true)
            
            const response = await axiosClient.get(`/transaction/list/?page=${page}&page_size=${pageSize}`)
            setSubHistory(response.data?.items || [])
            setFormerSubHistory(response.data?.items || [])
            setCount(response.data?.count || 0)
            setValue("")
    
        } catch (error: any) {
            toast.error(error.response?.data?.message);
        } finally {
            setLoadingSubscription(false)
        } 
    }

    const getPlans = async () => {
      
        try {
    
          setLoadingPlans(true)
          
          const response = await axiosClient.get("/subscription/")
          setPlansData(response.data || [])
    
        } catch (error: any) {
          toast.error(error.response?.data?.message);
        } finally {
          setLoadingPlans(false)
        } 
    }

    useEffect(() => {
        getPlan()
        getPlans()
    }, [])

    useEffect(() => {
        getSubscription()
    }, [page, pageSize])
    
    const handleSubscription = () => {
        setOpenSubModal(true)
    }

    const handlePayment = async (paymentMethod: string) => {
    
        const paymentData = {
            plan: choosenSub?.title,
            amount: choosenSub?.price?.toString(),
            verifications_provided: choosenSub?.verifications_provided,
            coupon_code: couponCode
        }

        if(paymentMethod === 'flutterwave'){
            try {
                setSubmittingPayment(true)

                const result = await axiosClient.post("/flutterwave/payment/initiate/", paymentData)
                const paymentLink = result.data?.payment?.link;
                const couponMessage = result.data?.coupon?.message;

                if(couponMessage) {
                toast.info(couponMessage);
                }

                if (paymentLink) {
                window.location.href = paymentLink;
                } else {
                toast.error("No payment link received");
                }
        
            } catch (error: any) {
                toast.error(error.response?.data?.message);
        
            } finally {
                // setSubmittingPayment(false)
            }
        }else if(paymentMethod === 'nomba'){
            try {
                setSubmittingPayment(true)

                const result = await axiosClient.post("/nomba/payment/initiate/", paymentData)
                const paymentLink = result.data?.payment?.link;
                const couponMessage = result.data?.coupon?.message;

                if(couponMessage) {
                toast.info(couponMessage);
                }

                if (paymentLink) {
                window.location.href = paymentLink;
                } else {
                toast.error("No payment link received");
                }
        
            } catch (error: any) {
                toast.error(error.response?.data?.message);
        
            } finally {
                // setSubmittingPayment(false)
            }
        }
    }

    useEffect(() => {
        if(value === "all"){
            setSubHistory(formerSubHistory)
        }else{
            const filteredSubscriptions = formerSubHistory.filter(sub => {
                return sub?.status === value;
            });

            if(filteredSubscriptions.length !== 0){
                setSubHistory(filteredSubscriptions)
            }
        }
        
    }, [value])

  return (
    <div className='my-container space-y-4'>
        <ContainerTitle title='Subscriptions' desc='Manage your Tivro subscriptions'/>

        {loadingPlan ? (
            <div className="grid grid-col-1 gap-2">
                {arrayList.map((_, index) => (
                    <Skeleton key={index} />
                ))}
            </div>
        ) : (
            <div className='bg-light p-4 rounded-2xl border space-y-4'>
                <div>
                    <div className='flex gap-1 items-center justify-between'>
                        <div className='rounded-full size-10 bg-primary/20 flex items-center justify-center'>
                            <BsFillLightningChargeFill size={26} className="text-primary"/>
                        </div>
            
                        <div>
                            {/* coupon */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button>{(Object.keys(subData).length === 0 ||
                                        (
                                        subData.Number_of_verification === 0 &&
                                        subData.Total_verification_requested === 0 &&
                                        subData.completed_verification === 0
                                        )
                                    ) ? "Purchase Plan": "Upgrade Plan"}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl p-0 gap-0 w-[300px] max-h-[75vh] overflow-y-auto">
                                    <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                        <AlertDialogTitle className="text-base">Coupon Code</AlertDialogTitle>
                                        <AlertDialogCancel onClick={() => {setShowCouponInput(false); setCouponCode("")}} className="bg-background-light border-0 shadow-none size-8 rounded-full">
                                        <X className="size-6"/>
                                        </AlertDialogCancel>
                                    </AlertDialogHeader>
                                    <div>
                                        <div className="bg-light p-4 shadow dark:border rounded-b-2xl">
                                        {showCouponInput ? (
                                            <div>
                                            <div className="grid gap-2 mb-5">
                                                <Label htmlFor="code">Enter Coupon Code</Label>
                                                <Input id="code" type="text" value={couponCode} onChange={(e: any) => setCouponCode(e.target.value)} placeholder="Enter code here" />
                                            </div>
                                            <div className="w-full flex items-center justify-center">
                                                <Button disabled={couponCode.length < 3} onClick={handleSubscription}>Continue</Button>
                                            </div>
                                            </div>
                                        ) : (
                                            <div>
                                            <h3 className="font-semibold">Do you have a coupon code?</h3>
                                            <div className="w-full flex items-center justify-center gap-4 mt-4">
                                                <Button onClick={() => setShowCouponInput(true)}>Yes</Button>
                                                <Button onClick={handleSubscription}>No</Button>
                                            </div>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                </AlertDialogContent>
                            </AlertDialog>
                            {/* subscribe */}
                            <AlertDialog open={openSubModal} onOpenChange={setOpenSubModal}>
                                {/* <AlertDialogTrigger asChild>
                                <Button>Subscribe</Button>
                                </AlertDialogTrigger> */}
                                <AlertDialogContent className="rounded-2xl p-0 gap-0 min-w-[90%] lg:min-w-[70%] max-h-[75vh] overflow-y-auto">
                                <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                    <AlertDialogTitle className="text-base">Subscribe to a package</AlertDialogTitle>
                                    <AlertDialogCancel className="bg-background-light border-0 shadow-none size-8 rounded-full">
                                    <X className="size-6"/>
                                    </AlertDialogCancel>
                                </AlertDialogHeader>
                                <div>
                                    <div className="bg-light p-4 shadow dark:border rounded-b-2xl w-full">
                                    {loadingPlans ? (
                                        <div className="flex w-full items-center justify-center min-h-[50vh]">
                                        <Loading/>
                                        </div>
                                    ) : plansData.length === 0 ? (
                                        <div className='flex flex-col items-center justify-center min-h-[50vh] w-full'>
                                        <NotFound imageStyle='size-8' title='No plans found' desc='Please try again later'/>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-3">
                                        {plansData.map((item, index) => (
                                            <div key={index} className={`flex flex-col gap-4 p-4 ${index === 0 ? 'border rounded-tl-2xl rounded-tr-2xl md:rounded-tr-none md:rounded-bl-2xl' : index === 1 ? 'border-x md:border-y' : 'border rounded-bl-2xl rounded-br-2xl md:rounded-bl-none md:rounded-tr-2xl'}`}>
                                            <div className="flex flex-col gap-1">
                                                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                                                <HiBadgeCheck size={30} className="text-primary"/>
                                                </div>
                                                <h3 className="font-semibold">{item?.title}</h3>
                                                <p className="text-ring text-sm">{item?.description}</p>
                                            </div>

                                            <h3 className="font-bold text-2xl">₦{item?.price}</h3>
                                            {/* payment gateway */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                <Button onClick={() => setChoosenSub(item)}>
                                                    <BsFillLightningChargeFill size={14} className="text-primary-foreground"/>
                                                    Subscribe
                                                </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                                                <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                                    <AlertDialogTitle className="text-sm">Select payment method</AlertDialogTitle>
                                                    <AlertDialogCancel className="bg-background-light border-0 shadow-none size-8 rounded-full">
                                                    <X className="size-6"/>
                                                    </AlertDialogCancel>
                                                </AlertDialogHeader>
                                                <AlertDialogDescription className="bg-light rounded-b-2xl px-4 py-6 flex flex-col items-center justify-center gap-3">
                                                    {submittingPayment ? (
                                                        <span className="w-full min-h-[100px] flex items-center justify-center">
                                                        <Loader2 className="animate-spin size-10 text-primary" />
                                                        </span>
                                                    ) : (
                                                        <>
                                                        <Button onClick={() => handlePayment('flutterwave')} className="rounded-full p-2 min-h-16 min-w-[250px] flex items-center justify-between bg-background-light">
                                                            <span className="flex gap-2 items-center justify-center">
                                                            <span className="size-12 rounded-full bg-primary-foreground p-2 flex items-center justify-center">
                                                            <Image src={'/next-assets/flutterwave.png'} width={40} height={40} alt=""/>
                                                            </span>
                                                            <h4 className="text-accent-foreground font-semibold">Flutterwave</h4>
                                                            </span>
                                                            <ChevronRight size={14} className="text-accent-foreground"/>
                                                        </Button>

                                                        <Button onClick={() => handlePayment('nomba')} className="rounded-full p-2 min-h-16 min-w-[250px] flex items-center justify-between bg-background-light">
                                                            <span className="flex gap-2 items-center justify-center">
                                                            <span className="size-12 rounded-full bg-primary-foreground p-2 flex items-center justify-center">
                                                            <Image src={'/next-assets/nomba.png'} width={20} height={20} alt=""/>
                                                            </span>
                                                            <h4 className="text-accent-foreground font-semibold">Nomba</h4>
                                                            </span>
                                                            <ChevronRight size={14} className="text-accent-foreground"/>
                                                        </Button>
                                                        </>
                                                    )}
                                                </AlertDialogDescription>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            <div className="space-y-2">
                                            {['One Verifications', 'Personality check provided','Work place checks provided', 'Credit score verifications provided', 'Employability checks provided'].map((feature, index) => (
                                                <div key={index} className="flex gap-1 items-start">
                                                    <FaCircleCheck className="text-primary"/>
                                                    <span className="text-xs">{feature}</span>
                                                </div>
                                                ))}
                                            </div>

                                            {/* <div className="space-y-2">
                                                {item?.features.map((feature, index) => (
                                                <div key={index} className="flex gap-1 items-start">
                                                    <FaCircleCheck className="text-primary"/>
                                                    <span className="text-xs">{feature}</span>
                                                </div>
                                                ))}
                                            </div> */}
                                            </div>
                                        ))}
                                        </div>
                                    )}

                                    </div>
                                </div>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    <div className='flex flex-col mt-2'>
                        <div className="space-y-1">
                            <h4 className="text-sm leading-none">{subscriptionPlan?.plan}</h4>
                            
                        </div>
                        <div className="flex h-10 items-start md:items-center space-x-2 md:space-x-4 text-sm my-7">
                            <div>
                                <div className='mb-1'>Amount</div>
                                <p className="text-sm text-muted-foreground">{displayCurrency(Number(subscriptionPlan?.amount), "NGN")}</p>
                            </div>
                            <Separator orientation="vertical" />
                            <div>
                                <div className='mb-1'>Date issued</div>
                                <p className="text-sm text-muted-foreground">{subscriptionPlan?.date ? format(new Date(subscriptionPlan?.date), "dd MMM yyyy") : "N/A"}</p>
                            </div>
                            <Separator orientation="vertical" />
                            <div>
                                <div className='mb-1'>Subscription status</div>
                                <SubscriptionStatus status={subscriptionPlan?.status || "N/A"}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {loadingSubscription ? (
            <div className="mt-8">
                <div className='w-full h-72 bg-light rounded-sm shadow flex'>
                    <div className='p-4 grid w-full gap-2'>
                    {tableList.map((_, index) => (
                        <TableSkeleton key={index}/>
                    ))}
                    </div>
                </div>
            </div>
        ) : (
             <div className='bg-light p-4 rounded-2xl border'>
                <div className='flex items-center gap-2 mb-6'>
                    <p className="text-lg font-medium leading-none">Subscription history</p>
                </div>
            
                <div className="w-full p-2 rounded-2xl bg-light border min-h-[68vh] flex flex-col items-center justify-between">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted">
                            <TableHead className="rounded-tl-xl capitalize">Transaction</TableHead>
                            <TableHead className='capitalize'>Plan</TableHead>
                            <TableHead className='capitalize'>Date purchased</TableHead>
                            <TableHead className="capitalize">Amount</TableHead>
                             {subHistory.length === 0 ? (
                                <TableHead  className='rounded-tr-xl capitalize'>Status</TableHead>
                            ) : (
                            <TableHead className='rounded-tr-xl capitalize'>
                                <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="border-0 shadow-none justify-between"
                                    >
                                        Status
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                    <CommandInput placeholder="Search status..." />
                                    <CommandList>
                                        <CommandEmpty>No status found.</CommandEmpty>
                                        <CommandGroup>
                                        {subStatus.map((status) => (
                                            <CommandItem
                                            key={status.value}
                                            value={status.value}
                                            onSelect={(currentValue) => {
                                                setValue(currentValue === value ? "" : currentValue)
                                                setOpen(false)
                                            }}
                                            >
                                            {status.label}
                                            <Check
                                                className={cn(
                                                "ml-auto",
                                                value === status.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            </CommandItem>
                                        ))}
                                        </CommandGroup>
                                    </CommandList>
                                    </Command>
                                </PopoverContent>
                                </Popover>
                            </TableHead>
                            )}
                            </TableRow>
                        </TableHeader>
                        {
                        subHistory.length !== 0 &&
                            (
                            <TableBody>
                                {subHistory.map((history, index) => (
                                <TableRow key={index}>
                                    <TableCell className="capitalize">{history?.payment_gateway}</TableCell>
                                    <TableCell className='capitalize'>{history?.plan}</TableCell>
                                    <TableCell className='capitalize'>{format(new Date(history?.created_at), "dd MMM yyyy HH:mm a")}</TableCell>
                                    <TableCell className='capitalize'>₦{history?.amount}</TableCell>
                                    <TableCell className='capitalize'>
                                    <SubscriptionStatus status={history?.status}/>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                            )
                        }
                        
                    </Table>

                    {subHistory.length === 0 && !loadingSubscription &&
                    <div className='flex flex-col items-center justify-center min-h-[58vh] w-full'>
                        <NotFound imageStyle='size-14' title='No requests found' desc='You haven’t added any tenants yet'/>
                    </div>
                    }

                    {
                    subHistory.length !== 0 && !loadingSubscription &&
                    (
                    <div className='flex gap-2 items-center justify-between w-full my-2'>
                        <div className='flex gap-2 items-center justify-between'>
                            <Select value={pageSize.toString()} onValueChange={(val) => {
                                setPageSize(Number(val)); 
                                setPage(1)
                            }}>
                                <SelectTrigger className="w-[75px]">
                                <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectGroup>
                                    {[10, 20, 50, 70, 100].map((size) => (
                                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                                    ))}
                                </SelectGroup>
                                </SelectContent>
                            </Select>
                            <span className='text-muted-foreground'>Per Page</span>
                        </div>
                            
                        <div className='flex items-center justify-between'>
                            <button
                                className='px-1'
                                disabled={page <= 1}
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <Button variant={'ghost'} className='bg-red-500/10 text-red-700 border-0 font-semibold'>{page}</Button>
                            <button
                                className='px-1'
                                disabled={page >= Math.ceil(count / pageSize)}
                                onClick={() => setPage(prev => prev + 1)}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                    )
                    }
                </div>
            </div>
        )}
    </div>
  )
}

export default Page