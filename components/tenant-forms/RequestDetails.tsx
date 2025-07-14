"use client"
import {
    CardContent
  } from "@/components/ui/card"
import { Input } from "../ui/input"
import FormCardHeader from "./FormCardHeader"
import { Label } from "../ui/label"
import FormCardFooter from "./FormCardFooter"
import { FormEvent, FormEventHandler, useState } from "react"
import { useGlobalContext } from "@/context/GlobalContext"
import { z } from "zod"
import { toast } from "react-toastify"
import { useTenantStore } from "@/store/TenantStore"
import { axiosClient } from "@/GlobalApi"
import { useRouter } from "next/navigation"

const tenantSchema = z.object({
  first_name: z.string().min(1, "first name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z
  .string()
  .regex(/^\d+$/, "Phone number must contain only digits")
  .refine((val) => {
    if (val.startsWith("0")) return val.length === 11;
    return val.length === 10;
  }, {
    message: "Phone number must be 11 digits if it starts with 0, otherwise 10 digits",
  })
  .transform((val) => (val.startsWith("0") ? val.slice(1) : val))
})

type TenantFormValues = z.infer<typeof tenantSchema>

const RequestDetails = () => {

    const {
        requestDetails,
        setCurrentSection,
        identityCheck,
        setIdentityCheck,
        setRequestDetails,
        otp,
        formProgress,
        setFormProgress,
        setOtp,
        handleRequestDetailsChange
    } = useGlobalContext();

    const tenantInfo = useTenantStore((state) => state.tenantInfo)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        first_name: tenantInfo?.first_name,
        last_name: tenantInfo?.last_name,
        phone: tenantInfo.phone,
        email: tenantInfo.email,
        address: tenantInfo.address
    })
    const router = useRouter()


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const result = tenantSchema.safeParse(form)
                
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof TenantFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof TenantFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        try {

            setIsSubmitting(true)

            const data = {
                first_name: form?.first_name,
                last_name: form?.last_name,
                phone: form.phone,
                token: tenantInfo?.user_token
            }
            
            const result = await axiosClient.post("/update/tenant/", data)

            if(result.status === 200 || result.status === 201){
                toast.success(result.data.message);

                setCurrentSection("Identity check")
                setFormProgress({...formProgress, fraction: "2/6",  percent: 34})
                setRequestDetails({...requestDetails, completed: true,  iscurrentForm: false})
                setIdentityCheck({...identityCheck,  iscurrentForm: true})
            }else{
                
                toast.error(result.data?.message);
                router.replace(`/tenant/${tenantInfo?.user_token}`)
            }    

        } catch (error: any) {
            toast.error(error.response?.data?.message);

        } finally {
            setIsSubmitting(false)
        } 

    }

  return (
    <div className="shadow-none max-w-96">
            <FormCardHeader title="Confirm request details" desc="Please verify that these details match your information to proceed with the verification."/>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <CardContent className="px-4 py-2">
                    <div className="grid gap-6">
                        <div className='grid gap-6 md:gap-2 md:grid-cols-2'>
                            <div className="grid gap-2">
                                <Label htmlFor="firstname">First name</Label>
                                <Input id="firstname" type="text" placeholder="Enter first name here" value={form.first_name} onChange={(e: any) => setForm({ ...form, first_name: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastname">Last name</Label>
                                <Input id="lastname" type="text" placeholder="Enter last name here" value={form.last_name} onChange={(e: any) => setForm({ ...form, last_name: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className='grid gap-6'>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input id="email" type="email" placeholder="Enter email address" value={form.email} className="bg-background" disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone number</Label>
                                <Input id="phone" type="tel" placeholder="+234 9011222122" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Apartment address</Label>
                                <Input id="address" type="text" placeholder="Enter apartment address" value={form.address} className="bg-background" disabled />
                            </div>
                        </div>
                        
                    </div>
                </CardContent>
                <FormCardFooter text="Proceed" loading={isSubmitting}/>
            </form>
          </div>
  )
}

export default RequestDetails