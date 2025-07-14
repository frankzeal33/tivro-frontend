'use client'
import Title from "@/components/Title"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Plus, X } from "lucide-react"
import Image from "next/image"
import { BsFillLightningChargeFill } from "react-icons/bs";
import { HiBadgeCheck } from "react-icons/hi";
import { FaCircleCheck } from "react-icons/fa6";
import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback
} from "@/components/ui/avatar"
import NotFound from "@/components/NotFound"
import { useRouter } from "next/navigation"
import { SearchForm } from "@/components/sidebar/search-form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Status } from "@/components/Status"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loading } from "@/components/Loading"
import { toast } from "react-toastify"
import { axiosClient } from "@/GlobalApi"
import Skeleton from "@/components/Skeleton"
import TableSkeleton from "@/components/TableSkeleton"
import ReduceTextLength from "@/utils/ReduceTextLength"
import { StatusBoolean } from "@/components/StatusBoolean"
import { DateLabels } from "@/utils/DateLabels"
import { debounce } from "lodash"
import { z } from "zod"

type verificationType = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  request_id: string;
  identity_check: string;
  credit_check: string;
  employment_check: string;
  status: string;
  date: string;
}[]

type plansType = {
  title: string,
  description: string,
  verifications_provided: number,
  price: string,
  // features: string[];
}

type overviewType = {
  Number_of_verification: number;
  Total_verification_requested: number;
  completed_verification: number;
  plan: string
  status: string
}

type BVNType = {
  customer_phone?: string;
  [key: string]: any; // allow flexible shape
};

const BVNSchema = z
  .string()
  .min(1, "ID Number is required")
  .regex(/^\d{11}$/, "BVN must be exactly 11 digits");

//  {
//         title: "Diamond",
//         description: "Our basic gives you opportunity to verify",
//         verifications_provided: 10,
//         price: "10",
//         features: ['One Verifications', 'Personality check provided','Work place checks provided', 'Credit score verifications provided', 'Employability checks provided']
//     },
//     {
//         title: "Diamond",
//         description: "Our basic gives you opportunity to verify",
//         verifications_provided: 12,
//         price: "100.00",
//         features: ['Personality check provided', 'Work place checks provided', 'Credit score verifications provided', 'TivroAI', 'Employability checks provided']
//     },
//     {
//         title: "Diamond",
//         description: "Our basic gives you opportunity to verify",
//         verifications_provided: 15,
//         price: "100.00",
//         features: ['Personality check provided', 'Work place checks provided', 'Credit score verifications provided', 'Employability checks provided', 'TivroAI']
//     }

export default function Page() {

  const router = useRouter()
  const [choosenSub, setChoosenSub] = useState<Partial<plansType>>({})
  const [openSubModal, setOpenSubModal] = useState(false);
  const [couponCode, setCouponCode] = useState("")
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [loadingPage, setLoadingPage] = useState(false)
  const [loadingVerification, setLoadingVerification] = useState(false)
  const [verification, setVerification] = useState<verificationType>([])
  const [confirmingBVN,setConfirmingBVN] = useState(false)
  const [plansData, setPlansData] = useState<plansType[]>([])
  const [subData, setSubData] = useState<overviewType>({
    Number_of_verification: 0,
    Total_verification_requested: 0,
    completed_verification: 0,
    status: "",
    plan: ""
  })
  const [open, setOpen] = useState(false)
  const [openBVNModal, setOpenBVNModal] = useState(false)
  const [BVN, setBVN] = useState("")
  const [loadingBVN, setloadingBVN] = useState(false)
  const [sendingBVNOTP, setSendingBVNOTP] = useState(false)
  const [BVNOTP, setBVNOTP] = useState("")
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [submittingOTP, setSubmittingOTP] = useState(false)
  const [submittingOTPResend, setSubmittingOTPResend] = useState(false)
  const [BVNDetails, setBVNDetails] = useState<BVNType | null>(null);
  const arrayList = new Array(3).fill(null)
  const tableList = new Array(6).fill(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [count, setCount] = useState(0)

  const [search, setSearch] = useState("")
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [formerVerifications, setFormerVerifications] = useState<verificationType>([])

  const handleSubscription = () => {
    setOpenSubModal(true)
  }

  const getOverview = async () => {
  
    try {

      setLoadingPage(true)
      
      const response = await axiosClient.get("/dashboard/")
      setSubData(response.data || {})
      console.log(response.data)

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoadingPage(false)
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
    getOverview()
    getPlans()
    getVerifications()
  }, [])

  useEffect(() => {
    getVerifications()
  }, [page, pageSize])

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

  const requestVerification = async () => {
    try {

      setConfirmingBVN(true)
      
      const response = await axiosClient.post("/verify/landlord/bvn/", {token: BVNOTP})

      router.push("/dashboard/request-verification")

    } catch (error: any) {
      toast.error(error.response?.data?.message);
      setOpenBVNModal(true)
    } finally {
      setConfirmingBVN(false)
    } 
  }

  const ConfirmBVNFirst = () => {
    const result = BVNSchema.safeParse(BVN);

    if (!result.success) {
      const errorMessage = result.error.format()._errors[0] || "Invalid input";
      return toast.error(errorMessage);
    }

    setOpen(true)
  }

  const sendBVNOTP = async () => {
     try {

      setSendingBVNOTP(true)
      
      const response = await axiosClient.post("/request/bvn/", {bvn: BVN})
      setBVNDetails(response.data)

      toast.success("OTP Sent");
      setOpen(false)
      setShowOTPInput(true)

    } catch (error: any) {
      if(error.response?.data?.message === "NOT NULL constraint failed: Verifications_verificationdata.email"){
        toast.error("Something went wrong, Please contact support");
      }else{
        toast.error(error.response?.data?.message);
      }
    } finally {
      setSendingBVNOTP(false)
    } 
  }

  const verifyBVNOTP = async () => {
    try {

      setSubmittingOTP(true)
      
      const response = await axiosClient.post("/verify/bvn/otp/", {token: BVNOTP})
      toast.success(response.data?.message);
      setBVN("")
      setOpenBVNModal(false)

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setSubmittingOTP(false)
    } 
  }

  const resendBVNOTP = async () => {
    try {

      setSubmittingOTPResend(true)
      
      const response = await axiosClient.post("/bvn/resend/otp/", {bvn: BVN})
      toast.success("Another OTP has been sent");

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setSubmittingOTPResend(false)
    } 
  }

  const getVerifications = async () => {
  
    try {

      setLoadingVerification(true)
      
      const response = await axiosClient.get(`/verifications/?page=${page}&page_size=${pageSize}`)
      setVerification(response.data?.verifications || [])
      setCount(response.data?.total_items || 0)
      setFormerVerifications(response.data?.verifications || [])

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoadingVerification(false)
    } 
  }

  const performSearch = async (searchTerm: string) => {
      
    setLoadingSearch(true)

    try {

      console.log("searchterm=",searchTerm)
      const result = await axiosClient.get(`/search/verifications/?page=1&page_size=${pageSize}&search=${searchTerm}`)

      setVerification(result.data?.verifications || [])

      console.log("search=",result.data?.verifications)

    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingSearch(false)
    }
  };

  // Update debouncedQuery after user stops typing for 500ms
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query) {
        console.log("q", query);
        performSearch(query);
      }
    }, 500),
    [performSearch] // dependencies
  );

  // Call the debounced function whenever search changes
  useEffect(() => {
    if (!search) {
      setVerification(formerVerifications); // immediate fallback
    } else {
      debouncedSearch(search);
    }
  }, [search]);

  return (
    <div>
      <Title title="Overview" desc="View and manage tenant verifications request"/>
      {loadingPage ? (
        <div>
          <div className="grid grid-col-1 lg:grid-cols-3 gap-2">
            {arrayList.map((_, index) => (
              <Skeleton key={index} />
            ))}
          </div>
          <div className="mt-8">
            <div className='w-full h-80 bg-light rounded-sm shadow flex'>
              <div className='p-4 grid w-full gap-2'>
                {tableList.map((_, index) => (
                  <TableSkeleton key={index}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div>
            <div className="flex flex-col items-center justify-center w-full">
            {(Object.keys(subData).length === 0 ||
              (
                subData.Number_of_verification === 0 &&
                subData.Total_verification_requested === 0 &&
                subData.completed_verification === 0
              )) && (
                <div className={`flex flex-col gap-3 items-center justify-center max-w-96 text-center min-h-[70vh]`}>
                    <Image src={"/next-assets/empty1.png"} alt="" width={100} height={100} className="w-fit"/>
                    <h1 className='text-xl font-semibold'>You’ve not made any requests yet</h1>
                    <p className='text-ring'>Subscribe to a package to be able to make your first verification request</p>
                    {/* coupon */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>Subscribe</Button>
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
              )}    
            </div>
          </div>
      

        {/* overview data */}
        {(Object.keys(subData).length !== 0 &&
          (
            subData.Number_of_verification > 0 ||
            subData.Total_verification_requested > 0 ||
            subData.completed_verification > 0
          )) && (
          <div>
            <div className="grid grid-col-1 lg:grid-cols-3 gap-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{subData?.Number_of_verification}</CardTitle>
                  <CardDescription className="flex items-center justify-between gap-1">
                    <span>Number of verifications</span>
                    <span className="rounded-full px-2 py-0.5 text-green-500 bg-green-500/30">{subData?.plan}</span>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{subData?.Total_verification_requested}</CardTitle>
                  <CardDescription className="flex items-center justify-between gap-1">
                    <span>Total verification requested</span>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{subData?.completed_verification}</CardTitle>
                  <CardDescription className="flex items-center justify-between gap-1">
                    <span>Completed verifications</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="flex items-center justify-between gap-2 w-full my-6">
                 <SearchForm
                    inputValue={search}
                    inputOnChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Verifications..."
                    disabled={formerVerifications.length === 0}
                  />

              <Button loading={confirmingBVN} disabled={confirmingBVN} onClick={requestVerification}>
                {confirmingBVN ? "" : ( <Plus/>)}
                {confirmingBVN ? "Loading..." : "Request verification"}
              </Button>
            </div>

            <AlertDialog open={openBVNModal} onOpenChange={setOpenBVNModal}>
              <AlertDialogContent className="rounded-2xl p-0 gap-0 w-[300px] md:w-[350px] max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                  <AlertDialogTitle className="text-base">Verify your BVN</AlertDialogTitle>
                  <AlertDialogCancel onClick={() => {setShowCouponInput(false); setCouponCode("")}} className="bg-background-light border-0 shadow-none size-8 rounded-full">
                    <X className="size-6"/>
                  </AlertDialogCancel>
                </AlertDialogHeader>
                <div>
                  {showOTPInput ? (
                    <div className="bg-light p-4 shadow dark:border rounded-b-2xl">
                      <div>
                        <p className="mb-3 text-sm text-accent-foreground">{BVNDetails?.customer_phone}</p>
                        <div className="grid gap-2 mb-5">
                          <Label htmlFor="bvn">Enter the OTP</Label>
                          <Input id="bvn" type="number" value={BVNOTP} onChange={(e: any) => setBVNOTP(e.target.value)} placeholder="Enter OTP here" />
                          <span className='text-center text-sm flex items-center gap-1'>Didn’t receive a code?
                            {submittingOTPResend ?  
                              <Loader2 className="animate-spin size-5 text-primary" /> :
                              <Button variant={'link'} onClick={resendBVNOTP} className='p-0 text-primary font-medium'>Resend</Button>
                            }
                          </span>
                        </div>
                        <div className="w-full flex items-center justify-center">
                          <Button disabled={BVNOTP.length < 6 || submittingOTP} loading={sendingBVNOTP} onClick={verifyBVNOTP} className="min-w-32">
                            {submittingOTP ? "Verifying..." : "Verify"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-light p-4 shadow dark:border rounded-b-2xl">
                      <div>
                        <div className="grid gap-2 mb-5">
                          <Label htmlFor="bvn">Enter BVN</Label>
                          <Input id="bvn" type="number" value={BVN} onChange={(e: any) => setBVN(e.target.value)} placeholder="Enter BVN here" />
                        </div>
                        <div className="w-full flex items-center justify-center">
                          <Button disabled={BVN.length < 11} onClick={ConfirmBVNFirst} className="min-w-32">
                            Continue
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                  <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                      <AlertDialogTitle className="text-sm">Confirm your BVN</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription className="bg-light px-4 py-6 flex flex-col items-center justify-center gap-3">
                      <span>Please confirm that the BVN you’ve provided is correct before proceeding.</span>
                      <span className="text-lg text-secondary-foreground">{BVN}</span>
                  </AlertDialogDescription>
                  <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                      <AlertDialogCancel className='w-[50%] bg-light'>Cancel</AlertDialogCancel>
                      <Button loading={sendingBVNOTP} disabled={sendingBVNOTP} onClick={sendBVNOTP} type="button" className='w-[50%]'>
                          {sendingBVNOTP ? "Loading..." : "Proceed"}
                      </Button>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {loadingVerification || loadingSearch ? (
              <div>
                <div className='w-full h-80 bg-light rounded-md shadow flex'>
                  <div className='p-4 grid w-full gap-2'>
                    {tableList.map((_, index) => (
                      <TableSkeleton key={index}/>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full p-2 rounded-2xl bg-light border min-h-[68vh] flex flex-col items-center justify-between">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="rounded-tl-xl capitalize">Request ID</TableHead>
                      <TableHead className='capitalize'>Full name</TableHead>
                      <TableHead className='capitalize'>ID check</TableHead>
                      <TableHead className='capitalize'>Credit check</TableHead>
                      <TableHead className='capitalize'>Employment check</TableHead>
                      <TableHead className='capitalize'>Request Status</TableHead>
                      <TableHead className="rounded-tr-2xl capitalize">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  {
                  verification.length !== 0 &&
                    (
                      <TableBody>
                        {verification.map((request, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium capitalize">
                              #{ReduceTextLength(request?.request_id, 8)}
                              <p className="text-muted-foreground text-xs">{DateLabels(request?.date)}</p>
                            </TableCell>
                            <TableCell className='capitalize'>
                              <div className="flex items-center">
                                <Avatar className="-mx-2">
                                  <AvatarFallback>{`${request?.first_name[0] ?? ''}${request?.last_name[0] ?? ''}`.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="ml-3">
                                  {ReduceTextLength(`${request?.first_name} ${request?.last_name}`, 15)}
                                  <p className="text-muted-foreground text-xs">{request?.phone}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className='capitalize'><Status status={request?.identity_check}/></TableCell>
                            <TableCell className='capitalize'><Status status={request?.credit_check}/></TableCell>
                            <TableCell className='capitalize'><Status status={request?.employment_check}/></TableCell>
                            <TableCell className='capitalize'><Status status={request?.status}/></TableCell>
                            <TableCell className='capitalize text-center bg-muted/30'>
                                <Link href={`/dashboard/request-verification/${request?.id}`}>
                                    <Button variant={'ghost'}>View</Button>
                                </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    )
                  }
                  
                </Table>

                {verification.length === 0 &&
                  <div className='flex flex-col items-center justify-center min-h-[58vh] w-full'>
                    {search ? (
                      <NotFound imageStyle='size-14' title='No requests found' desc='Try a different search'/>
                    ) : (
                      <NotFound imageStyle='size-14' title='No requests found' desc='You haven’t added any requests yet'/>
                    )}
                  </div>
                }

                {
                  verification.length !== 0 && !search &&
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
            )}
          </div>
        )}
      </div>
      )}
    </div>
  )
}
