"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
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
import { ContainerTitle } from '@/components/ContainerTitle'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { IoIosInformationCircle } from "react-icons/io";
import { z } from 'zod'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import displayCurrency from '@/utils/displayCurrency'

const tenantSchema = z.object({
  property_id: z.string().min(1, "Property is required"),
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
  .transform((val) => (val.startsWith("0") ? val.slice(1) : val)),
  email: z.string().email("Invalid email address"),
  move_in: z.string().min(1, "Occupancy data is required"),
  renewal_date: z.string().min(1, "Renewal date is required")
});

type tenantFormValues = z.infer<typeof tenantSchema>

const Page = () => {
    const [value, setValue] = useState<string | undefined>(undefined)
    const [date, setDate] = useState<Date>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingPage, setLoadingPage] = useState(false)
    const [properties, setProperties] = useState([])
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
        property_id: "",
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        move_in: "",
        renewal_date: "",
    })

    const getProperties = async () => {
      
        try {
    
          setLoadingPage(true)
          
          const response = await axiosClient.get("/properties")
          setProperties(response.data.items || [])
    
        } catch (error: any) {
          toast.error(error.response?.data?.message);
        } finally {
          setLoadingPage(false)
        } 
      }

    useEffect(() => {
        getProperties()
    }, [])

     const openModal = () => {
        const result = tenantSchema.safeParse(form)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof tenantFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof tenantFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        setOpen(true)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const result = tenantSchema.safeParse(form)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof tenantFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof tenantFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
    
        const data = {
            property_id: form.property_id,
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            email: form.email,
            move_in: format(new Date(form.move_in), "yyyy-MM-dd"),
            renewal_date: format(new Date(form.renewal_date), "yyyy-MM-dd"),
        }
            
        try {

            setIsSubmitting(true)
            
            const result = await axiosClient.post("/tenant/", data)

            if(result.data?.status === 200 && result.data?.success === true){
                toast.success("Tenant Added Successfully");
            }else{
                toast.error(result.data.message);
            }

            setForm({
                property_id: "",
                first_name: "",
                last_name: "",
                phone: "",
                email: "",
                move_in: "",
                renewal_date: "",
            })

            setOpen(false)

        } catch (error: any) {
            toast.error(error.response?.data?.message);

        } finally {
            setIsSubmitting(false)
        } 
    }

  return (
    <div className='my-container space-y-4'>
        <ContainerTitle title='Add a new tenant' desc='Provide the tenant’s details to proceed' goBack='/dashboard/tenant-management'/>

        <div className='bg-light p-4 rounded-2xl border'>
            <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <div className='grid gap-6 md:grid-cols-2'>
                        <div className="grid gap-2">
                            <Label htmlFor="firstname">First name</Label>
                            <Input id="firstname" type="text" value={form.first_name} onChange={(e: any) => setForm({ ...form, first_name: e.target.value})} placeholder="Enter first name here" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastname">Last name</Label>
                            <Input id="lastname" type="text" value={form.last_name} onChange={(e: any) => setForm({ ...form, last_name: e.target.value})} placeholder="Enter last name here" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="property">Select a property</Label>
                        <Select onValueChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                property_id: value,
                            }))
                        }>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a property" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Properties</SelectLabel>
                                    {properties.map(({ property_name, house_id }, index) => (
                                        <SelectItem key={house_id} value={house_id}>{property_name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='grid gap-6 md:grid-cols-2'>
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
                        <div className="grid gap-2">
                            <Label htmlFor="Occupancy-date">Occupancy date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "justify-start text-left font-normal bg-light",
                                        !date && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon />
                                    {form.move_in ? format(new Date(form.move_in), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                                    <Select
                                        onValueChange={(value) => {
                                            const newDate = addDays(new Date(), parseInt(value));
                                            setForm((prev) => ({
                                                ...prev,
                                                move_in: newDate.toISOString(),
                                            }));
                                        }}
                                    >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectItem value="-1">Yesterday</SelectItem>
                                        <SelectItem value="0">Today</SelectItem>
                                        <SelectItem value="1">Tomorrow</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <div className="rounded-md border">
                                       <Calendar mode="single" selected={form.move_in ? new Date(form.move_in) : undefined} onSelect={(date) => {
                                            setForm((prev) => ({
                                                ...prev,
                                                move_in: date?.toISOString() ?? "",
                                        }))}}/>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="Renewal-date">Renewal date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "justify-start text-left font-normal bg-light",
                                        !date && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon />
                                    {form.renewal_date ? format(new Date(form.renewal_date), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                                    <Select
                                        onValueChange={(value) => {
                                            const newDate = addDays(new Date(), parseInt(value));
                                            setForm((prev) => ({
                                                ...prev,
                                                renewal_date: newDate.toISOString(),
                                            }));
                                        }}
                                    >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectItem value="180">6 months from today</SelectItem>
                                        <SelectItem value="365">1 year from today</SelectItem>
                                        <SelectItem value="730">2 years from today</SelectItem>
                                        <SelectItem value="1095">3 years from today</SelectItem>
                                        <SelectItem value="1460">4 years from today</SelectItem> 
                                        <SelectItem value="1825">5 years from today</SelectItem> 
                                    </SelectContent>
                                    </Select>
                                    <div className="rounded-md border">
                                        <Calendar mode="single" selected={form.renewal_date ? new Date(form.renewal_date) : undefined} onSelect={(date) => {
                                            setForm((prev) => ({
                                                ...prev,
                                                renewal_date: date?.toISOString() ?? "",
                                        }))}}/>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className='w-full flex items-center bg-muted gap-1 border border-l-primary border-l-6 rounded-md p-2'>
                            <IoIosInformationCircle size={20} className='text-muted-foreground'/>
                            <p className='text-muted-foreground text-xs md:text-sm'>Please note that you would be charged {displayCurrency(Number(1000), "NGN")} for initiating this request.</p>  
                        </div>
                    </div>
                    
                    <Button type="button" onClick={openModal} className='max-w-48'>
                        Add a new tenant
                    </Button>

                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                            <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                <AlertDialogTitle className="text-sm">Confirm request</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogDescription className="bg-light px-4 py-6 flex flex-col items-center justify-center gap-3">
                                <span>You are about to add a new tenant . Please ensure that the details you’ve provided are correct before proceeding.</span>
                            </AlertDialogDescription>
                            <AlertDialogFooter className='flex flex-row items-center justify-between w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                                <AlertDialogCancel className='w-[47%] bg-light'>Cancel</AlertDialogCancel>
                                <Button loading={isSubmitting} disabled={isSubmitting} onClick={handleSubmit} type="button" className='max-w-48'>
                                    {isSubmitting ? "Adding..." : "Proceed"}
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