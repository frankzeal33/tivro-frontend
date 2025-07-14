"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import PhoneInput from 'react-phone-number-input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { z } from 'zod'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'

const requestSchema = z.object({
  first_name: z.string().min(1, "first name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
  .string()
  .regex(/^\d+$/, "Phone number must contain only digits")
  .refine((val) => {
    if (val.startsWith("0")) return val.length === 11;
    return val.length === 10;
  }, {
    message: "Phone number must be 11 digits if it starts with 0, otherwise 10 digits",
  })
  .transform((val) => (val.startsWith("0") ? val.slice(1) : val)),
  address: z.string().min(1, "Address is required"),
});

type RequestFormValues = z.infer<typeof requestSchema>

const Page = () => {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string | undefined>(undefined)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        address: ""
    })

    const router = useRouter()
    
    const openModal = () => {
        const result = requestSchema.safeParse(form)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof RequestFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof RequestFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        setOpen(true)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
       const result = requestSchema.safeParse(form)
               
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof RequestFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof RequestFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        // const removeFirstZero = form.phone.startsWith("0") ? form.phone.slice(1) : form.phone;
        // const phoneNo = "234" + removeFirstZero;

        // const data = {
        //     ...form,
        //     phone: phoneNo
        // }

            
        try {

            setIsSubmitting(true)
            
            const result = await axiosClient.post("/request/verification/", form)

            if(result.data?.status === 500){
                toast.error(result.data?.message)
                setOpen(false)
            }else if(result.data?.status === 200){
                toast.success("Request Sent")
                setOpen(false)
                setForm({
                    first_name: "",
                    last_name: "",
                    phone: "",
                    email: "",
                    address: ""
                })
            }else{
                toast.error(result.data?.message)
                setOpen(false)
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message);

        } finally {
            setIsSubmitting(false)
        } 
    }

  return (
    <div className='my-container space-y-4'>
        <div  className='flex items-end justify-between gap-2'>
            <div>
                <Link href={'/dashboard'} className="text-sm mb-6 flex gap-1 items-center">
                    <ArrowLeft size={16} className="text-normal"/>
                    Back
                </Link>
                <h2 className='font-bold text-2xl'>Verification request</h2>
                <p className='text-muted-foreground'>Provide the tenant’s details to proceed with verification</p>
            </div>
        </div>

        <div className='bg-light p-4 rounded-2xl border'>
            <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <div className='grid gap-6 md:grid-cols-2'>
                        <div className="grid gap-2">
                            <Label htmlFor="firstname">First name</Label>
                            <Input id="firstname" type="text" value={form.first_name} onChange={(e: any) => setForm({ ...form, first_name: e.target.value})} placeholder="Enter your first name here" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastname">Last name</Label>
                            <Input id="lastname" type="text" value={form.last_name} onChange={(e: any) => setForm({ ...form, last_name: e.target.value})} placeholder="Enter your last name here" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input id="email" type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value})} placeholder="Enter email address" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone no.</Label>
                            <Input id="phone" type="number" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value})} placeholder="Enter phone no." />
                            {/* <PhoneInput
                                placeholder="Enter phone number"
                                value={value}
                                defaultCountry="NG"
                                onChange={phone => setValue(phone)}
                                className='border p-2 rounded-md text-sm focus:outline-0 w-full'
                            /> */}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="Home address">Home address</Label>
                        <Input id="Home address" type="text" value={form.address} onChange={(e: any) => setForm({ ...form, address: e.target.value})} placeholder="Enter your name here" />
                    </div>
                    
                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <Button type="button" onClick={openModal} className='max-w-48'>
                            Request Verification
                        </Button>
                        <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                            <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                <AlertDialogTitle className="text-sm">Confirm verification request</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogDescription className="bg-light px-4 py-6 flex flex-col items-center justify-center gap-3">
                                <span>You are about to send a verification request. Please endure that the details you’ve provided are correct before proceeding.</span>
                            </AlertDialogDescription>
                            <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                                <AlertDialogCancel className='w-[50%] bg-light'>Cancel</AlertDialogCancel>
                                <Button loading={isSubmitting} disabled={isSubmitting} onClick={handleSubmit} type="button" className='w-[50%]'>
                                    {isSubmitting ? "Requesting..." : "Proceed"}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Page