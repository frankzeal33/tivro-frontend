"use client"
import Title from '@/components/Title'
import React, { useEffect, useState } from 'react'
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
import { ChevronLeft, ChevronRight, X } from "lucide-react" 
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import NotFound from '@/components/NotFound'
import { axiosClient } from '@/GlobalApi'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ReduceTextLength from '@/utils/ReduceTextLength'
import TableSkeleton from '@/components/TableSkeleton'

type messageType = {
    id: number;
    title: string;
    body: string;
    status: boolean;
    created_at: string;
}[]

const Page = () => {

  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messages, setMessages] = useState<messageType>([])
  const [count, setCount] = useState(0)
   const tableList = new Array(8).fill(null)

   const [page, setPage] = useState(1)
   const [pageSize, setPageSize] = useState(10)


   const getMessages = async () => {
    
      try {
  
        setLoadingMessages(true)
        
        const response = await axiosClient.get(`/notification/?page=${page}&page_size=${pageSize}`)
        setMessages(response.data?.items || [])
        setCount(response.data?.count || 0)
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setLoadingMessages(false)
      } 
    }
  
    useEffect(() => {
      getMessages()
    }, [page, pageSize])


  return (
    <div className='my-container'>
        <Title title='Inbox' desc='View new messages here'/>

        {loadingMessages ? (
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
            <div className='bg-light p-4 rounded-2xl border'>
                <div className='flex items-center gap-2 mb-6'>
                    <p className="text-lg font-medium leading-none">Messages({count})</p>
                </div>

                <div className="w-full p-2 rounded-2xl bg-light border min-h-[68vh] flex flex-col items-center justify-between">
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-muted">
                            <TableHead className="rounded-tl-xl capitalize">Title</TableHead>
                            <TableHead className='capitalize'>Message</TableHead>
                            <TableHead className='capitalize'>Date received</TableHead>
                            <TableHead className="rounded-tr-2xl capitalize">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    {
                    messages.length !== 0 &&
                        (
                        <TableBody>
                            {messages.map((message, index) => (
                            <TableRow key={message?.id}>
                                <TableCell className={`capitalize ${message?.status && 'font-semibold'}`}>{ReduceTextLength(message?.title, 45)}</TableCell>
                                <TableCell className={`capitalize ${message?.status && 'font-semibold'}`}>{ReduceTextLength(message?.body, 20)}</TableCell>
                                <TableCell className={`capitalize ${message?.status && 'font-semibold'}`}>{format(new Date(message?.created_at), "dd MMM yyyy HH:mm a")}</TableCell>
                                <TableCell className='capitalize text-center bg-muted/30'>
                                
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant={`${message?.status ? 'default' : 'ghost'}`}>View</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[600px] max-h-[95%] overflow-y-auto gap-0">
                                            <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-4">
                                                <AlertDialogTitle className="text-sm">{message?.title} 🎉</AlertDialogTitle>
                                                <AlertDialogCancel className="bg-background-light border-0 shadow-none size-8 rounded-full">
                                                    <X className="size-6"/>
                                                </AlertDialogCancel>
                                            </AlertDialogHeader>
                                            <AlertDialogDescription className="bg-light px-4 rounded-b-2xl py-6 text-justify flex flex-col gap-3">
                                                {message?.body}
                                            </AlertDialogDescription>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        )
                    }
                    
                    </Table>

                    {messages.length === 0 &&
                    <div className='flex flex-col items-center justify-center min-h-[58vh] w-full'>
                        <NotFound imageStyle='size-14' title='No requests found' desc='You haven’t added any tenants yet'/>
                    </div>
                    }

                    {
                    messages.length !== 0 &&
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