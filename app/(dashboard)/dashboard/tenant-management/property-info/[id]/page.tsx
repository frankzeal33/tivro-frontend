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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
import NotFound from '@/components/NotFound'
import { ContainerTitle } from '@/components/ContainerTitle'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { useParams } from 'next/navigation'
import Skeleton from '@/components/Skeleton'
import TableSkeleton from '@/components/TableSkeleton'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import ReduceTextLength from '@/utils/ReduceTextLength'
import { format } from 'date-fns'

const requests = [
    {
      id: 1,
      fullName: 'Ojiego Franklin',
      occupancyDate: '14 Aug 2024, 3:34 PM',
      renewalDate: '14 Aug 2024, 3:34 PM',
    },
    {
      id: 1,
      fullName: 'Ojiego Franklin',
      occupancyDate: '14 Aug 2024, 3:34 PM',
      renewalDate: '14 Aug 2024, 3:34 PM',
    },
    {
      id: 1,
      fullName: 'Ojiego Franklin',
      occupancyDate: '14 Aug 2024, 3:34 PM',
      renewalDate: '14 Aug 2024, 3:34 PM',
    },
]

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

type propertyFormValues = z.infer<typeof propertySchema>

type historyType = {
  property_name: string;
  tenant_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  move_in: string;
  renewal_date: string;
  Active_tenant: boolean
}[]

type propertyType = {
  house_id: string;
  property_name: string;
  address: string;
  house_type: string;
  number_of_rooms: number;
  number_of_flats: number;
  property_description: string;
}

const Page = () => {

  const params = useParams();
    const id = params.id;
    const [loadingProperty, setLoadingProperty] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [property, setProperty] = useState<propertyType | null>(null)
    const [history, setHistory] = useState<historyType>([])
    const [openEditProperty, setOpenEditProperty] = useState(false)
    const [submittingProperty, setSubmittingProperty] = useState(false)
    const [openConfirmModal, setOpenConfirmModal] = useState(false)
    const arrayList = new Array(2).fill(null)
    const tableList = new Array(6).fill(null)
    const [editForm, setEditForm] = useState({
      property_name: "",
      address: "",
      house_type: "",
      number_of_rooms: "",
      number_of_flats: "",
      property_description: ""
    })

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [count, setCount] = useState(0)
  
    const getProperty = async () => {
      
      try {
        setLoadingProperty(true)
        
        const response = await axiosClient.get(`/property/${id}/`)
        setProperty(response.data || {})
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoadingProperty(false)
      } 
    }
  
    const getHistory = async () => {
      
      try {
  
        setLoadingHistory(true)
        
        const response = await axiosClient.get(`/property/${id}/tenants/?page=${page}&page_size=${pageSize}`)
        setHistory(response.data?.items || [])
        setCount(response.data?.count || 0)
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoadingHistory(false)
      } 
    }
    
    useEffect(() => {
      getProperty()
    }, [id])

    useEffect(() => {
      getHistory()
    }, [id, page, pageSize])

    useEffect(() => {
      if (property) {
        setEditForm({
          property_name: property?.property_name ?? "",
          address: property?.address ?? "",
          house_type: property?.house_type ?? "",
          number_of_rooms: property?.number_of_rooms ? property?.number_of_rooms.toString() : "",
          number_of_flats: property?.number_of_flats ? property?.number_of_flats.toString() : "",
          property_description: property?.property_description?? "",
        });
      }
    }, [property]);

    const confirmEditProperty = async (e: FormEvent) => {
        e.preventDefault()
        const result = propertySchema.safeParse(editForm)
               
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof propertyFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof propertyFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
    
        setOpenConfirmModal(true)
      }
    
      const handleEditPropertySubmit = async (e: FormEvent) => {
        e.preventDefault()
        const result = propertySchema.safeParse(editForm)
               
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof propertyFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof propertyFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
    
        const data = {
          ...editForm,
          number_of_rooms: Number(editForm.number_of_rooms),
          number_of_flats: Number(editForm.number_of_flats)
        }

        try {
    
          setSubmittingProperty(true)
          
          const response = await axiosClient.put(`/property/${id}/`, data)
          toast.success("Property Updated")
    
          getProperty()
    
          setOpenConfirmModal(false)
          setOpenEditProperty(false)
    
        } catch (error: any) {
          toast.error(error.response?.data?.message);
        } finally {
          setSubmittingProperty(false)
        } 
      }

  return (
    <div className='my-container space-y-4'>

      {loadingProperty ? (
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
                  <h2 className='font-bold text-2xl'>Property information</h2>
                  <p className='text-muted-foreground'>View your property details here</p>
              </div>
              <div className='flex gap-1'>
                <AlertDialog open={openEditProperty} onOpenChange={setOpenEditProperty}>
                      <AlertDialogTrigger asChild>
                        <Button><Plus/> Edit Property</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto">
                          <form>
                              <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                  <AlertDialogTitle className="text-sm">Edit Property</AlertDialogTitle>
                                  <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                              </AlertDialogHeader>
                              <AlertDialogDescription className="w-full bg-light px-4 py-4 flex flex-col items-center justify-center gap-3">
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="p-name" className='text-accent-foreground'>Property Name</Label>
                                      <Input id="p-name" value={editForm.property_name} onChange={(e: any) => setEditForm({ ...editForm, property_name: e.target.value})} placeholder="Enter here"/>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="p-type" className='text-accent-foreground'>Property Type</Label>
                                      <Input id="p-type" value={editForm.house_type} onChange={(e: any) => setEditForm({ ...editForm, house_type: e.target.value})}placeholder="Enter here"/>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="p-address" className='text-accent-foreground'>Property Address</Label>
                                      <Input id="p-address" type="text" value={editForm.address} onChange={(e: any) => setEditForm({ ...editForm, address: e.target.value})} placeholder="Enter here" />
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="flats" className='text-accent-foreground'>Number of Flats</Label>
                                      <Input id="flats" type="number" value={editForm.number_of_flats} onChange={(e: any) => setEditForm({ ...editForm, number_of_flats: e.target.value})} placeholder="Enter here"/>
                                  </span>
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="rooms" className='text-accent-foreground'>Number of Rooms</Label>
                                      <Input id="rooms" type="number" value={editForm.number_of_rooms} onChange={(e: any) => setEditForm({ ...editForm, number_of_rooms: e.target.value})} placeholder="Enter here"/>
                                  </span>
                                  <span className="grid gap-2 w-full">
                                      <Label htmlFor="Property description">Property Description</Label>
                                      <Textarea  value={editForm.property_description} onChange={(e: any) => setEditForm({ ...editForm, property_description: e.target.value})} placeholder="Enter property description here" />
                                  </span>
                              </AlertDialogDescription>
                              <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                                  <Button type="button" className='w-full' onClick={confirmEditProperty}>
                                    Update Property
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
                    <span>You are about to submit an updated infomation of your property. Please ensure that the new edited fields are correct before proceeding.</span>
                </AlertDialogDescription>
                <AlertDialogFooter className='flex flex-row items-center justify-between w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                    <AlertDialogCancel className='w-[47%] bg-light'>Cancel</AlertDialogCancel>
                    <Button loading={submittingProperty} disabled={submittingProperty} onClick={handleEditPropertySubmit} type="button" className='max-w-48'>
                        {submittingProperty ? "Updating..." : "Update Property"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className='bg-light p-4 rounded-2xl border space-y-4'>
            <p className='text-lg font-semibold'>Property information</p>

            <Card className='shadow-none'>
                <CardContent>               
                    <div>
                        <div className='grid md:grid-cols-2 gap-4'>
                            <div>
                                <p className="text-sm font-medium leading-none">Property name</p>
                                <p className="text-sm text-muted-foreground">{property?.property_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">Property type</p>
                                <p className="text-sm text-muted-foreground">{property?.house_type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">No of flats</p>
                                <p className="text-sm text-muted-foreground">{property?.number_of_flats}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">No of rooms</p>
                                <p className="text-sm text-muted-foreground">{property?.number_of_rooms}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">Property Location</p>
                                <p className="text-sm text-muted-foreground">{property?.address}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">House ID</p>
                                <p className="text-sm text-muted-foreground">{property?.house_id}</p>
                            </div>
                        </div>
                        <div className='bg-muted p-2 rounded-xl mt-4'>
                            <p className="text-sm font-medium leading-none mb-1">Property description</p>
                            <p className="text-sm text-muted-foreground">{property?.property_description}</p>
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
            <p className="text-lg font-medium leading-none">History</p>
          </div>

          <div className="w-full p-2 rounded-2xl bg-light border min-h-[68vh] flex flex-col items-center justify-between">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="rounded-tl-xl capitalize">Full name</TableHead>
                  <TableHead className=" capitalize">Contact</TableHead>
                  <TableHead className='capitalize'>Occupancy date</TableHead>
                  <TableHead className='capitalize'>Renewal date</TableHead>
                  <TableHead className='rounded-tr-xl capitalize'>Action</TableHead>
                </TableRow>
              </TableHeader>
              {
              history.length !== 0 &&
                (
                  <TableBody>
                    {history.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className='capitalize'>
                          {ReduceTextLength(item?.full_name, 20)}
                        </TableCell>
                        <TableCell className='capitalize'>
                          {item?.phone}
                        </TableCell>
                        <TableCell className='capitalize'>
                          {item?.move_in && format(new Date(item?.move_in), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className='capitalize'>{item?.renewal_date && format(new Date(item?.renewal_date), "dd MMM yyyy")}</TableCell>
                        <TableCell className='capitalize text-center bg-muted/30'>
                            <Link href={`/dashboard/tenant-management/tenant-info/${item?.tenant_id}`}>
                                <Button variant={'ghost'} className='bg-light'>View Profile</Button>
                            </Link>
                        </TableCell>
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