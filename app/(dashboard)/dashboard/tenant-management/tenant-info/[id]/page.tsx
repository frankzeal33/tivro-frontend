"use client"
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import Link from 'next/link'
import React, { FormEvent, useEffect, useState } from 'react'
import {
    Card,
    CardContent,
  } from "@/components/ui/card"
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import NotFound from '@/components/NotFound'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { z } from 'zod'
import displayCurrency from '@/utils/displayCurrency'
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import Skeleton from '@/components/Skeleton'
import TableSkeleton from '@/components/TableSkeleton'


type tenantType = {
  id: number,
  tenant_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  property_name: string;
  move_in: string;
  renewal_date: string;
  status: boolean
}

type historyType = {
  purpose_of_invoice: string;
  amount: string;
  date: string;
}[]

const invoiceSchema = z.object({
  purpose_of_invoice: z.string().min(1, "Purpose of invoice is required"),
  amount: z.string().min(1, "Amount is required"),
});

type invoiceFormValues = z.infer<typeof invoiceSchema>

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
  .transform((val) => (val.startsWith("0") ? val.slice(1) : val)),
  email: z.string().email("Invalid email address"),
  move_in: z.string().min(1, "Occupancy data is required"),
  renewal_date: z.string().min(1, "Renewal date is required"),
  active_tenant: z.boolean(),
});

type tenantFormValues = z.infer<typeof tenantSchema>

const Page = () => {

  const params = useParams();
  const id = params.id;
  const [date, setDate] = useState<Date>()
  const [loadingTenant, setLoadingTenant] = useState(false)
  const [loadingInvoice, setLoadingInvoice] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [history, setHistory] = useState<historyType>([])
  const [openInvoice, setOpenInvoice] = useState(false)
  const [openEditTenant, setOpenEditTenant] = useState(false)
  const [submittingTenant, setSubmittingTenant] = useState(false)
  const [openConfirmModal, setOpenConfirmModal] = useState(false)
  const [tenant, setTenant] = useState<tenantType>({
    id: 0,
    tenant_id: "",
    full_name: "",
    email: "",
    phone: "",
    address: "",
    property_name: "",
    move_in: "",
    renewal_date: "",
    status: false
  })
  const [invoiceForm, setInvoiceForm] = useState<invoiceFormValues>({
    purpose_of_invoice: "",
    amount: ""
  })
  const [editForm, setEditForm] = useState({
    first_name: tenant?.full_name ? tenant.full_name.split(" ")[0] : "",
    last_name: tenant?.full_name ? tenant?.full_name.split(" ").slice(1).join(" ") : "",
    phone: "",
    email: "",
    move_in: "",
    renewal_date: "",
    active_tenant: true
  })
  const arrayList = new Array(2).fill(null)
  const tableList = new Array(6).fill(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [count, setCount] = useState(0)

  const getTenant = async () => {
    
    try {
      setLoadingTenant(true)
      setLoadingHistory(true)
      
      const response = await axiosClient.get(`/tenant/${id}/`)
      setTenant(response.data.tenant || {})

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoadingTenant(false)
    } 
  }

  const getHistory = async () => {
    
    try {

      setLoadingHistory(true)
      
      const response = await axiosClient.get(`/total/invoice/?id_tenant=${tenant?.id}&page=${page}&page_size=${pageSize}`)
      setHistory(response.data.items || [])
      setCount(response.data?.count || 0)

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoadingHistory(false)
    } 
  }
  
  useEffect(() => {
    getTenant()
  }, [id])

  useEffect(() => {
    if(tenant?.id) {
      getHistory()
    }
  }, [tenant?.id, page, pageSize])

  useEffect(() => {
    if (tenant) {
      setEditForm({
        first_name: tenant.full_name ? tenant.full_name.split(" ")[0] : "",
        last_name: tenant.full_name ? tenant.full_name.split(" ").slice(1).join(" ") : "",
        phone: tenant.phone ?? "",
        email: tenant.email ?? "",
        move_in: tenant.move_in ? tenant.move_in : "",
        renewal_date: tenant?.renewal_date ? tenant.renewal_date : "",
        active_tenant: tenant.status ?? false,
      });
    }
  }, [tenant]);

  const sendInvoice = async (e: FormEvent) => {
    e.preventDefault()
    const result = invoiceSchema.safeParse(invoiceForm)
          
    if (!result.success) {
        const fieldErrors: Partial<Record<keyof invoiceFormValues, string>> = {};
        result.error.errors.forEach((err) => {
          const field = err.path[0] as keyof invoiceFormValues
          fieldErrors[field] = err.message
        })
        toast.error(Object.values(fieldErrors)[0]);
        return
    }

    const data = {
      id_tenant: tenant?.id,
      first_name: tenant?.full_name ? tenant.full_name.split(" ")[0] : "",
      last_name: tenant?.full_name ? tenant?.full_name.split(" ").slice(1).join(" ") : "",
      property_name: tenant?.property_name,
      purpose_of_invoice: invoiceForm.purpose_of_invoice,
      amount: invoiceForm.amount,
      email: tenant?.email
    }

    try {

      setLoadingInvoice(true)
      
      const response = await axiosClient.post(`/send/invoice/`, data)
      toast.success(response.data?.message)

      getHistory()

      setInvoiceForm({
        purpose_of_invoice: "",
        amount: ""
      })
      setOpenInvoice(false)

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoadingInvoice(false)
    } 
  }

  const confirmEditTenant = async (e: FormEvent) => {
    e.preventDefault()
    const result = tenantSchema.safeParse(editForm)
           
    if (!result.success) {
        const fieldErrors: Partial<Record<keyof tenantFormValues, string>> = {};
        result.error.errors.forEach((err) => {
            const field = err.path[0] as keyof tenantFormValues
            fieldErrors[field] = err.message
        })
        toast.error(Object.values(fieldErrors)[0]);
        return
    }

    setOpenConfirmModal(true)
  }

  const handleEditTenantSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const result = tenantSchema.safeParse(editForm)
           
    if (!result.success) {
        const fieldErrors: Partial<Record<keyof tenantFormValues, string>> = {};
        result.error.errors.forEach((err) => {
            const field = err.path[0] as keyof tenantFormValues
            fieldErrors[field] = err.message
        })
        toast.error(Object.values(fieldErrors)[0]);
        return
    }

    const tenantData = {
      full_name: `${editForm.first_name} ${editForm.last_name}`,
      phone: editForm.phone,
      email: editForm.email,
      move_in: format(new Date(editForm.move_in), "yyyy-MM-dd"),
      renewal_date: format(new Date(editForm.renewal_date), "yyyy-MM-dd"),
      active_tenant: editForm.active_tenant
    }

    try {

      setSubmittingTenant(true)
      
      const response = await axiosClient.put(`/tenant/${id}/`, tenantData)
      toast.success(response.data?.message)

      getTenant()

      setOpenConfirmModal(false)
      setOpenEditTenant(false)

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setSubmittingTenant(false)
    } 
  }

  return (
    <div className='my-container space-y-4'>
      
       {loadingTenant ? (
            <div className="grid grid-col-1 gap-4">
                {arrayList.map((_, index) => (
                    <Skeleton key={index} />
                ))}
            </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-2'>
              <div>
                  <Link href={'/dashboard/tenant-management'} className="text-sm mb-6 flex gap-1 items-center">
                      <ArrowLeft size={16} className="text-normal"/>
                      Back
                  </Link>
                  <h2 className='font-bold text-2xl'>Tenant information</h2>
                  <p className='text-muted-foreground'>View new tenant details here</p>
              </div>
              <div className='flex gap-1'>
                  <AlertDialog open={openEditTenant} onOpenChange={setOpenEditTenant}>
                      <AlertDialogTrigger asChild>
                        <Button variant={'outline'} className='bg-light'><Plus/> Edit Profile</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto">
                          <form>
                              <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                  <AlertDialogTitle className="text-sm">Edit Tenant</AlertDialogTitle>
                                  <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                              </AlertDialogHeader>
                              <AlertDialogDescription className="w-full bg-light px-4 py-4 flex flex-col items-center justify-center gap-3">
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="firstname" className='text-accent-foreground'>First name</Label>
                                      <Input id="firstname" value={editForm.first_name} onChange={(e: any) => setEditForm({ ...editForm, first_name: e.target.value})} placeholder="Enter here"/>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="lastname" className='text-accent-foreground'>Last name</Label>
                                      <Input id="lastname" value={editForm.last_name} onChange={(e: any) => setEditForm({ ...editForm, last_name: e.target.value})}placeholder="Enter here"/>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="email" className='text-accent-foreground'>Email address</Label>
                                      <Input id="email" type="email" value={editForm.email} onChange={(e: any) => setEditForm({ ...editForm, email: e.target.value})} placeholder="Enter here" />
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="Phone" className='text-accent-foreground'>Phone no.</Label>
                                      <Input id="Phone" type="number" value={editForm.phone} onChange={(e: any) => setEditForm({ ...editForm, phone: e.target.value})} placeholder="Enter here"/>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="Purpose" className='text-accent-foreground'>Occupancy Date</Label>
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
                                            {editForm.move_in ? format(new Date(editForm.move_in), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                                            <Select
                                                onValueChange={(value) => {
                                                    const newDate = addDays(new Date(), parseInt(value));
                                                    setEditForm((prev) => ({
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
                                                <Calendar mode="single" selected={editForm.move_in ? new Date(editForm.move_in) : undefined} onSelect={(date) => {
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        move_in: date?.toISOString() ?? "",
                                                }))}}/>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="amount" className='text-accent-foreground'>Renewal Date</Label>
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
                                            {editForm.renewal_date ? format(new Date(editForm.renewal_date), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                                            <Select
                                                onValueChange={(value) => {
                                                    const newDate = addDays(new Date(), parseInt(value));
                                                    setEditForm((prev) => ({
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
                                                <Calendar mode="single" selected={editForm.renewal_date ? new Date(editForm.renewal_date) : undefined} onSelect={(date) => {
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        renewal_date: date?.toISOString() ?? "",
                                                }))}}/>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                    <Label htmlFor="Property-name" className='text-accent-foreground'>Tenant Status</Label>
                                    <Select value={String(editForm.active_tenant)} onValueChange={(value) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            active_tenant: value === "true"
                                        }))
                                    }>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a property" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                            <SelectLabel>Tenant currently {editForm.active_tenant ? "Active" : "In Active"}</SelectLabel>
                                              <SelectItem value={"true"}>Active</SelectItem>
                                              <SelectItem value={"false"}>In Active</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                  </span>
                              </AlertDialogDescription>
                              <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                                  <Button type="button" className='w-full' onClick={confirmEditTenant}>
                                    Update Tenant
                                  </Button>
                              </AlertDialogFooter>
                          </form>
                      </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog open={openInvoice} onOpenChange={setOpenInvoice}>
                      <AlertDialogTrigger asChild>
                        <Button>Send Invoice</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto">
                          <form onSubmit={sendInvoice}>
                              <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                  <AlertDialogTitle className="text-sm">Send invoice</AlertDialogTitle>
                                  <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                              </AlertDialogHeader>
                              <AlertDialogDescription className="w-full bg-light px-4 py-4 flex flex-col items-center justify-center gap-3">
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="firstname" className='text-accent-foreground'>First name</Label>
                                      <Input id="firstname" className='bg-background-light' value={tenant?.full_name ? tenant.full_name.split(" ")[0] : ""} placeholder="Enter here" disabled/>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="lastname" className='text-accent-foreground'>Last name</Label>
                                      <Input id="lastname" className='bg-background-light' value={tenant?.full_name ? tenant?.full_name.split(" ").slice(1).join(" ") : ""} placeholder="Enter here" disabled/>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="Property-name" className='text-accent-foreground'>Property name</Label>
                                      <Input id="Property-name" className='bg-background-light' value={tenant?.property_name ?? ""} placeholder="Enter here" disabled/>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="Purpose" className='text-accent-foreground'>Purpose for invoice</Label>
                                      <Input id="Purpose" type="text" value={invoiceForm.purpose_of_invoice ?? ""} onChange={(e: any) => setInvoiceForm({ ...invoiceForm, purpose_of_invoice: e.target.value})} placeholder="Enter here" />
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="email" className='text-accent-foreground'>Email address</Label>
                                      <Input id="email" className='bg-background-light' value={tenant?.email ?? ""} placeholder="Enter here" disabled />
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="amount" className='text-accent-foreground'>Enter amount</Label>
                                      <Input id="amount" type="number" value={invoiceForm.amount ?? ""} onChange={(e: any) => setInvoiceForm({ ...invoiceForm, amount: e.target.value})} placeholder="Enter amount here" />
                                  </span>
                              </AlertDialogDescription>
                              <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                                  <Button loading={loadingInvoice} disabled={loadingInvoice} type="submit" className='w-full'>
                                      {loadingInvoice ? "Sending Invoice..." : "Send Invoice"}
                                  </Button>
                              </AlertDialogFooter>
                          </form>
                      </AlertDialogContent>
                  </AlertDialog>
              </div>
            </div>

          <AlertDialog open={openConfirmModal} onOpenChange={setOpenConfirmModal}>
              <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                  <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                      <AlertDialogTitle className="text-sm">Confirm Edit</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription className="bg-light px-4 py-6 flex flex-col items-center justify-center gap-3">
                      <span>You are about to submit an updated infomation of your tenant. Please ensure that the new edited fields are correct before proceeding.</span>
                  </AlertDialogDescription>
                  <AlertDialogFooter className='flex flex-row items-center justify-between w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                      <AlertDialogCancel className='w-[47%] bg-light'>Cancel</AlertDialogCancel>
                      <Button loading={submittingTenant} disabled={submittingTenant} onClick={handleEditTenantSubmit} type="button" className='max-w-48'>
                          {submittingTenant ? "Updating..." : "Update Tenant"}
                      </Button>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>

          <div className='bg-light p-4 rounded-2xl border space-y-4'>
              <Card className='shadow-none'>
                  <CardContent>               
                      <div className='flex flex-col gap-4 items-center justify-center'>
                          <Avatar className='size-32'>
                            <AvatarImage src={'/next-assets/photo.png'} alt="TV" />
                          </Avatar>
                          <div className='flex flex-col items-center justify-center gap-2'>
                              <p className="text-2xl font-medium leading-none text-center">{tenant?.full_name}</p>
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
                              <p className="text-sm text-muted-foreground">{tenant?.full_name ? tenant.full_name.split(" ")[0] : ""}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">Last name</p>
                              <p className="text-sm text-muted-foreground">{tenant?.full_name ? tenant?.full_name.split(" ").slice(1).join(" ") : ""}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">Email</p>
                              <p className="text-sm text-muted-foreground">{tenant?.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">Phone No</p>
                              <p className="text-sm text-muted-foreground">{tenant?.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">Occupancy date</p>
                              <p className="text-sm text-muted-foreground">{tenant?.move_in ? format(new Date(tenant.move_in), "dd MMM yyyy") : "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">Renewal date</p>
                              <p className="text-sm text-muted-foreground">{tenant?.move_in ? format(new Date(tenant?.renewal_date), "dd MMM yyyy") : "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">Selected property</p>
                              <p className="text-sm text-muted-foreground">{tenant?.property_name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">Property Location</p>
                              <p className="text-sm text-muted-foreground">{tenant?.address}</p>
                            </div>
                        </div>
                      </div>
                  </CardContent>
              </Card>
          </div>
          </div>
        )}

        {loadingHistory ? (
            <div className="mt-4">
                <div className='w-full h-72 bg-light rounded-sm shadow flex'>
                    <div className='p-4 grid w-full gap-2'>
                    {tableList.map((_, index) => (
                        <TableSkeleton key={index}/>
                    ))}
                    </div>
                </div>
            </div>
        ) : (
          <div className='bg-light p-4 rounded-2xl border space-y-4'>
            <div className='flex items-center gap-2 mb-6'>
              <p className="text-lg font-medium leading-none">History({count})</p>
            </div>

            <div className="w-full p-2 rounded-2xl bg-light border min-h-[68vh] flex flex-col items-center justify-between">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className='rounded-tl-xl capitalize'>Purpose of Invoice</TableHead>
                  <TableHead className='capitalize'>Amount</TableHead>
                  <TableHead className='rounded-tr-xl capitalize'>Date Sent</TableHead>
                </TableRow>
              </TableHeader>
              {
              history.length !== 0 &&
                (
                  <TableBody>
                    {history.map((info, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium capitalize">{info?.purpose_of_invoice}</TableCell>
                        <TableCell className='capitalize'>{displayCurrency(Number(info?.amount), "NGN")}</TableCell>
                        <TableCell className='capitalize'>{format(new Date(info?.date), "dd-MMM-yyyy hh:mm a")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )
              }
              
            </Table>

            {history.length === 0 &&
              <div className='flex flex-col items-center justify-center min-h-[58vh] w-full'>
                <NotFound imageStyle='size-14' title='No data found' desc='No history added yet'/>
              </div>
            }

            {
              history.length !== 0 &&
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