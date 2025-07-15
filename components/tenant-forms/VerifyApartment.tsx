import {
  Card,
  CardContent,
 
} from "@/components/ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import FormCardHeader from "./FormCardHeader"
import { Label } from "../ui/label"
import FormCardFooter from "./FormCardFooter"
import Image from "next/image"
import { useGlobalContext } from "@/context/GlobalContext"
import { FormEvent, useState } from "react"
import { useTenantStore } from "@/store/TenantStore"
import { toast } from "react-toastify"
import { axiosClient } from "@/GlobalApi"
import displayCurrency from "@/utils/displayCurrency"

const  VerifyApartment = ({inspectionAmount}: {inspectionAmount: number}) => {

  const {
    setCurrentSection,
    apartmentInspection,
    setApartmentInspection,
    otp,
    employmentInfo,
    setFormProgress,
    formProgress,
    certificate,
    setOtp,
    setCertificate,
    setEmploymentInfo
  } = useGlobalContext();

  const [loading, setLoading] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)
    
  const tenantInfo = useTenantStore((state) => state.tenantInfo)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try{
      setLoading(true)


      const result = await axiosClient.post(`/apartment/verification/consent/?token=${tenantInfo?.user_token}&consent=no`)

      if(result.status === 200){
        toast.success(result.data?.message)

        setCurrentSection("certificates")
        setFormProgress({...formProgress, fraction: "6/6",  percent: 100})
        setApartmentInspection({...apartmentInspection, completed: true,  iscurrentForm: false})
        setCertificate({...certificate,  completed: true, iscurrentForm: true})

      }else{
        toast.error(result.data?.message);
        setCurrentSection("employment-check")
        setFormProgress({...formProgress, fraction: "4/6",  percent: 68})
        setOtp({...otp, completed: true,  iscurrentForm: false})
        setEmploymentInfo({...employmentInfo,  iscurrentForm: true})
      }

    } catch (error: any) {
      toast.error(error.response?.data?.detail);
    } finally {
      setLoading(false)
    }

  }

  const pay = async () =>  {
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
      // setLoadingPayment(false)
    }
  }

return (
  <div className="shadow-none max-w-96">
          <FormCardHeader title="Apartment inspection" desc="Confirm apartment information provided before"/>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <CardContent className="px-4 py-2">
                  <div className="grid gap-6">
                      <div className='grid gap-6'>
                          <div className="grid gap-2">
                              <Label htmlFor="id">Apartment address</Label>
                              <Input id="id" type="number" value={tenantInfo?.address} placeholder={tenantInfo?.address} className="bg-background" disabled/>
                          </div>
                      </div>
                      <Card className="p-4 shadow-none grid lg:grid-cols-2 gap-2">
                        <div className="space-y-3">
                          <h4>Inspection service</h4>
                          <p className="text-xs text-muted-foreground">Are you too busy to inspect the apartment? Let us handle it for you! We'll provide a detailed report within 48 hours.</p>
                          <p className="text-xs text-muted-foreground">Inspection fee: <span className="text-primary font-bold">{displayCurrency(Number(inspectionAmount), "NGN")}</span></p>
                          <Button variant={'outline'} type="button" onClick={pay} className="bg-light" loading={loadingPayment} disabled={loadingPayment}>{loadingPayment ? "Loading..." : "Yes, proceed"}</Button>
                        </div>
                        <div className="hidden lg:flex">
                          <Image src={'/next-assets/inspect.png'} width={100} height={100} alt="" className="w-full h-full rounded-2xl"/>
                        </div>
                      </Card>

                      <div>
                        <div className='w-full flex flex-col bg-muted gap-1 border border-l-primary border-l-6 rounded-md p-2'>
                          <h4 className="text-sm font-semibold">Property inspection request</h4>
                          <p className='text-muted-foreground text-xs md:text-sm'>Thank you for choosing Tivro. You’d be notified via mail with a detailed property inspection report within 48 hours.</p>  
                        </div>
                      </div>
                      
                  </div>
              </CardContent>
              <FormCardFooter text="Finish" loading={loading || loadingPayment} />
          </form>
        </div>
)
}

export default VerifyApartment