"use client"
import Title from '@/components/Title'
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
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react" 
import { cn } from "@/lib/utils"
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
import { Status } from '@/components/Status'
import NotFound from '@/components/NotFound'
import { useEffect, useState } from 'react'
import { axiosClient } from '@/GlobalApi'
import { toast } from 'react-toastify'
import TableSkeleton from '@/components/TableSkeleton'
import ReduceTextLength from '@/utils/ReduceTextLength'
import { format } from 'date-fns'


const certStatus = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "passed",
    label: "Passed",
  },
  {
    value: "failed",
    label: "Failed",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "ongoing",
    label: "Ongoing",
  }
]

type CertType = {
  id: number;
  address: string;
  status: "pending" | "ongoing" | "passed" | "failed"
  first_name: string;
  last_name: string;
  created_at: string;
}[]

const Page = () => {

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [loadingPage, setLoadingPage] = useState(false)
  const [certificates, setCeretificates] = useState<CertType>([])
  const [formerCertificates, setFormerCeretificates] = useState<CertType>([])
  const tableList = new Array(8).fill(null)
  const [statusFilter, setStatusFilter] = useState("")

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [count, setCount] = useState(0)

  const getCert = async () => {
    
      try {
  
        setLoadingPage(true)
        
        const response = await axiosClient.get(`/certificate/list/?page=${page}&page_size=${pageSize}`)
        setCeretificates(response.data?.items || [])
        setFormerCeretificates(response.data?.items || [])
        setCount(response.data?.count || 0)
        setValue("")
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoadingPage(false)
      } 
    }
  
    useEffect(() => {
      getCert()
    }, [page, pageSize])

    useEffect(() => {
      if(value === "all"){
        setCeretificates(formerCertificates)
      }else{
        const filteredCertificates = formerCertificates.filter(cert => {
          return cert?.status === value;
        });

        if(filteredCertificates.length !== 0){
          setCeretificates(filteredCertificates)
        }
      }
     
    }, [value])

  return (
    <div className='my-container'>
        <Title title='Certificates' desc='Manage tenant certification here'/>

        {loadingPage ? (
          <div className="mt-8">
            <div className='w-full h-[60vh] bg-light rounded-sm shadow flex'>
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
                  <TableHead className="rounded-tl-xl capitalize">Full name</TableHead>
                  <TableHead className='capitalize'>Address</TableHead>
                  <TableHead className='capitalize'>Date created</TableHead>
                  {certificates.length === 0 ? (
                    <TableHead className='capitalize'>Status</TableHead>
                  ) : (
                     <TableHead className='capitalize'>
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
                                {certStatus.map((status) => (
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
                  <TableHead className="rounded-tr-2xl capitalize">Action</TableHead>
                </TableRow>
              </TableHeader>
              {
              certificates.length !== 0 &&
                (
                  <TableBody>
                    {certificates.map((cert, index) => (
                      <TableRow key={index}>
                        <TableCell className="capitalize">{ReduceTextLength(`${cert?.first_name} ${cert?.last_name}`, 15)}</TableCell>
                        <TableCell className='capitalize'>{ReduceTextLength(cert?.address, 45)}</TableCell>
                        <TableCell className='capitalize'>{cert?.created_at ? format(new Date(cert?.created_at), "dd MMM yyyy, hh:mm a") : "N/A"}</TableCell>
                        <TableCell className='capitalize'>
                          <Status status={cert?.status}/>
                        </TableCell>
                        <TableCell className='capitalize text-center bg-muted/30'>
                            <Link href={`/dashboard/certificates/${cert?.id}`}>
                                <Button variant={'ghost'}>View</Button>
                            </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )
              }
              
            </Table>

            {certificates.length === 0 &&
               <div className='flex flex-col items-center justify-center min-h-[58vh] w-full'>
                <NotFound imageStyle='size-14' title='No requests found' desc='You haven’t added any tenants yet'/>
              </div>
            }

            {
              certificates.length !== 0 &&
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
  )
}

export default Page