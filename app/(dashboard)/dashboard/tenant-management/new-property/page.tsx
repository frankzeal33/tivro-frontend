"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
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
  Card
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from '@/components/ui/textarea'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'

const propertySchema = z.object({
    property_name: z.string().min(1, "Property name is required"),
    house_type: z.string().min(1, "Property type is required"),
    address: z.string().min(1, "Property location is required"),
    number_of_flats: z.preprocess((val) => {
        // Make empty input fail validation with a custom message later
        if (val === "") return undefined;
        return Number(val);
        }, z.number({
        required_error: "Number of flats is required",
        invalid_type_error: "Number of flats must be a number",
        })
    .min(0, "Number of flats must be 0 or more")
    .refine((val) => Number.isInteger(val), {
        message: "Number of flats must be a whole number",
    })),
    number_of_rooms: z.coerce.number()
    .min(1, "Number of rooms must be at least 1")
    .refine((val) => Number.isInteger(val), {
        message: "Number of rooms must be a whole number",
        }),
    
    property_description: z.string(),
});

type PropertyFormValues = z.infer<typeof propertySchema>

const Page = () => {

    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState("Property information");
    const [form, setForm] = useState({
        property_name: "",
        address: "",
        house_type: "",
        property_description: "",
        number_of_rooms: "",
        number_of_flats: ""
    })

    const router = useRouter()
    
    const openModal = () => {
        const result = propertySchema.safeParse(form)

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof PropertyFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof PropertyFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        setOpen(true)
    }

    const handleSubmit = async () => {

        const result = propertySchema.safeParse(form)

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof PropertyFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof PropertyFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        const data = {
        ...form,
        number_of_rooms: Number(form.number_of_rooms),
        number_of_flats: Number(form.number_of_flats)
        }
            
        try {

            setIsSubmitting(true)
            
            const result = await axiosClient.post("/property/", data)
            toast.success(result.data.message);

            setForm({
                property_name: "",
                address: "",
                house_type: "",
                property_description: "",
                number_of_rooms: "",
                number_of_flats: ""
            })

            setOpen(false)
            setActiveTab("Property information");

            toast.success("New Property Added Successfully")

        } catch (error: any) {
            toast.error(error.response?.data?.message);

        } finally {
            setIsSubmitting(false)
        } 
    }

    const toggle = (value: string) => {
        if(value === 'next'){
            setActiveTab("Next")
        }else if(value === 'prev'){
            setActiveTab("Property information")
        }
    }

  return (
    <div className='my-container space-y-4'>
        <ContainerTitle title='Add a new property' desc='Provide the property details to proceed' goBack='/dashboard/tenant-management'/>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 bg-light border p-0 shadow-none">
                <TabsTrigger value="Property information" className='rounded-r-none bg-background text-xs md:text-sm'>Property information</TabsTrigger>
                <TabsTrigger value="Next" className='rounded-l-none bg-background text-xs md:text-sm'>Next</TabsTrigger>
            </TabsList>
            <TabsContent value="Property information">
                <Card className='w-full shadow-none mt-4 p-4'>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="property">Property name</Label>
                            <Input id="property" value={form.property_name} type="text" onChange={(e: any) => setForm({ ...form, property_name: e.target.value})} placeholder="Enter property name here"/>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="property type">Property type</Label>
                            <Input id="property type"  value={form.house_type} type="text" onChange={(e: any) => setForm({ ...form, house_type: e.target.value})} placeholder="Enter property type here"/>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location"  value={form.address} type="text" onChange={(e: any) => setForm({ ...form, address: e.target.value})} placeholder="Enter property location here"/>
                        </div>

                        <Button type="submit" className='max-w-24 ml-auto' onClick={() => toggle('next')}>
                            Next
                        </Button>
                    </div>
                </Card>
            </TabsContent>
            <TabsContent value="Next">
                <Card className='w-full shadow-none mt-4 p-4'>
                <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="Number of flats">Number of flats</Label>
                            <Input id="Number of flats"  value={form.number_of_flats} type="number" onChange={(e: any) => setForm({ ...form, number_of_flats: e.target.value})} placeholder="Enter number of flats here"/>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="Number of rooms">Number of rooms</Label>
                            <Input id="Number of rooms"  value={form.number_of_rooms} type="number" onChange={(e: any) => setForm({ ...form, number_of_rooms: e.target.value})} placeholder="Enter number of rooms here"/>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="Property description">Property description (optional)</Label>
                            <Textarea  value={form.property_description} onChange={(e: any) => setForm({ ...form, property_description: e.target.value})} placeholder="Enter property description here" />
                        </div>

                        <div className='ml-auto flex gap-2'>
                            <Button type="submit" variant={'outline'} className='max-w-48 bg-light' onClick={() => toggle('prev')}>
                                Previous
                            </Button>

                            <Button onClick={openModal} type="button" className='max-w-48'>
                                Complete
                            </Button>

                            <AlertDialog open={open} onOpenChange={setOpen}>
                                <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                                    <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                        <AlertDialogTitle className="text-sm">Confirm request</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogDescription className="bg-light px-4 py-6 flex flex-col items-center justify-center gap-3">
                                        <span>You are about to add a new property. Please ensure that the details you’ve provided are correct before proceeding. </span>
                                    </AlertDialogDescription>
                                    <AlertDialogFooter className='flex items-center flex-row justify-between w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                                        <AlertDialogCancel className='w-[47%] bg-light'>Cancel</AlertDialogCancel>
                                        <Button loading={isSubmitting} disabled={isSubmitting} onClick={handleSubmit} type="button" className='max-w-48'>
                                            {isSubmitting ? "Adding..." : "Proceed"}
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            
                        </div>
                    </div>
                </Card>
            </TabsContent>
        </Tabs>

    </div>
  )
}

export default Page