'use client'
import Title from "@/components/Title"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react";
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
import NotFound from "@/components/NotFound"
import { Label } from '@/components/ui/label'
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
import { TenentStatus } from "@/components/TenantStatus"
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";
import displayCurrency from "@/utils/displayCurrency";
import { Loading } from "@/components/Loading";
import { format } from "date-fns";
import Skeleton from "@/components/Skeleton";
import { debounce } from "lodash";
import TableSkeleton from "@/components/TableSkeleton";
import ReduceTextLength from "@/utils/ReduceTextLength";

type tenantType = {
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
}[]

export default function Page() {

  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Tenants");
  const [TenantTable, setTenantTable] = useState<tenantType>([]);
  const [PropertyTable, setPropertyTable] = useState<propertyType>([]);
  const [loadingTenantTable, setLoadingTenantTable] = useState(false);
  const [loadingPropertyTable, setLoadingPropertyTable] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [overview, setOverview] = useState({
    total_property: 0, 
    tenant: 0, 
    wallet: 0
  });
  const [amount, setAmount] = useState("");
  const arrayList = new Array(3).fill(null)
  const tableList = new Array(6).fill(null)
  const [searchTenants, setSearchTenants] = useState("")
  const [searchProperties, setSearchProperties] = useState("")
  const [loadingTenantSearch, setLoadingTenantSearch] = useState(false)
  const [loadingPropertySearch, setLoadingPropertySearch] = useState(false)

  const [formerTenantTable, setFormerTenantTable] = useState<tenantType>([]);
  const [formerPropertyTable, setFormerPropertyTable] = useState<propertyType>([]);

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [count, setCount] = useState(0)

  const [propertyPage, setPropertyPage] = useState(1)
  const [propertyPageSize, setPropertyPageSize] = useState(10)
  const [propertyCount, setPropertyCount] = useState(0)

  const getOVerview = async () => {
  
    try {

      setLoadingOverview(true)
      
      const response = await axiosClient.get("/overview/property/tenant/")
      setOverview(response.data || overview)

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoadingOverview(false)
    } 
  }

  const getTenants = async () => {
  
    try {

      setLoadingTenantTable(true)
      
      const response = await axiosClient.get(`/tenants/?page=${page}&page_size=${pageSize}`)
      setTenantTable(response.data.items || [])
      setCount(response.data?.count || 0)
      setFormerTenantTable(response.data.items || [])

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoadingTenantTable(false)
    } 
  }

  const getProperties = async () => {
  
    try {

      setLoadingPropertyTable(true)
      
      const response = await axiosClient.get(`/properties/?page=${propertyPage}&page_size=${propertyPageSize}`)
      setPropertyTable(response.data.items || [])
      setPropertyCount(response.data?.count || 0)
      setFormerPropertyTable(response.data.items || [])

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoadingPropertyTable(false)
    } 
  }

  useEffect(() => {
    getOVerview()
  }, [])

  useEffect(() => {
    getTenants()
  }, [ page, pageSize])

  useEffect(() => {
    getProperties()
  }, [ propertyPage, propertyPageSize])

  const handlePayment = async (paymentMethod: string) => {

    const data = {
      amount: Number(amount)
    }

    if(paymentMethod === 'flutterwave'){
      try {
          setSubmittingPayment(true)

          const result = await axiosClient.post("/flutterwave/fundwallet/", data)
          const paymentLink = result.data?.payment?.link;

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

          const result = await axiosClient.post("/nomba/fundwallet/", data)
          const paymentLink = result.data?.payment?.link;

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

  const performTenantSearch = async (searchTerm: string) => {
        
      setLoadingTenantSearch(true)
  
      try {
  
        const response = await axiosClient.get(`/tenants/?page=1&page_size=${pageSize}&search=${searchTerm}`)
  
        setTenantTable(response.data.items || [])
  
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setLoadingTenantSearch(false)
      }
    };
  
    // Update debouncedQuery after user stops typing for 500ms
    const debouncedTenantSearch = useCallback(
      debounce((query: string) => {
        if (query) {
          performTenantSearch(query);
        }
      }, 500),
      [performTenantSearch]
    );
  
    // Call the debounced function whenever search changes
    useEffect(() => {
      if (!searchTenants) {
        setTenantTable(formerTenantTable); // immediate fallback
      } else {
        debouncedTenantSearch(searchTenants);
      }
    }, [searchTenants]);

    const performPropertySearch = async (searchTerm: string) => {
        
      setLoadingPropertySearch(true)
  
      try {
  
        const response = await axiosClient.get(`/properties/?page=1&${propertyPageSize}=4&search=${searchTerm}`)
  
        setPropertyTable(response.data.items || [])
  
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setLoadingPropertySearch(false)
      }
    };
  
    // Update debouncedQuery after user stops typing for 500ms

      const debouncedPropertySearch = useCallback(
        debounce((query: string) => {
          if (query) {
            performPropertySearch(query);
          }
        }, 500),
        [ performPropertySearch]
      );
  
    // Call the debounced function whenever search changes
    useEffect(() => {
      if (!searchProperties) {
        setPropertyTable(formerPropertyTable); // immediate fallback
      } else {
        debouncedPropertySearch(searchProperties);
      }
    }, [searchProperties]);

  return (
    <div>
      <div>
        <Title title="Tenant Management" desc="View and manage tenant seamlessly with ease">
            <div className="flex gap-2">
                <Link href={'/dashboard/tenant-management/new-property'}>
                    <Button variant={'outline'}>Add Property</Button>
                </Link>
               
                <Link href={'/dashboard/tenant-management/new-tenant'}>
                    <Button>Add Tenant</Button>
                </Link>
            </div>
        </Title>
      </div>
      
        <div>
          {loadingOverview ? (
            <div>
              <div className="grid grid-col-1 lg:grid-cols-3 gap-2">
                {arrayList.map((_, index) => (
                  <Skeleton key={index} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-col-1 lg:grid-cols-3 gap-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{displayCurrency(Number(overview?.wallet), "NGN")}</CardTitle>
                  <CardDescription className="flex items-center justify-between gap-1">
                    <span>Wallet balance</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>Fund Wallet</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                          <form>
                              <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                  <AlertDialogTitle className="text-sm">Fund wallet</AlertDialogTitle>
                                  <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                              </AlertDialogHeader>
                              <AlertDialogDescription className="w-full bg-light px-4 py-4 flex items-center justify-center gap-3">
                                  <span className='grid gap-2 w-full'>
                                      <Label htmlFor="amount">Enter amount</Label>
                                      <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Enter amount here" />
                                  </span>
                              </AlertDialogDescription>
                              <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                                  <AlertDialogAction  disabled={amount.length < 1} className='w-full' onClick={() => setOpen(true)}>Make Payment</AlertDialogAction>
                              </AlertDialogFooter>
                          </form>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{overview?.tenant}</CardTitle>
                  <CardDescription className="flex items-center justify-between gap-1">
                    <span>Total number of tenants</span>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{overview?.total_property}</CardTitle>
                  <CardDescription className="flex items-center justify-between gap-1">
                    <span>Total number of properties</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-1 mt-7 mb-3">
              <TabsList className="grid grid-cols-2 bg-light border p-0 shadow-none w-[200px]">
                  <TabsTrigger value="Tenants" className='rounded-r-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'>Tenants</TabsTrigger>
                  <TabsTrigger value="Properties" className='rounded-l-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'>Properties</TabsTrigger>
              </TabsList>
              {activeTab === "Tenants" ? (
                <SearchForm
                  inputValue={searchTenants}
                  inputOnChange={(e) => setSearchTenants(e.target.value)}
                  placeholder="Search Tenants..."
                  disabled={formerTenantTable.length === 0}
                />
              ) : (
                <SearchForm
                  inputValue={searchProperties}
                  inputOnChange={(e) => setSearchProperties(e.target.value)}
                  placeholder="Search Properties..."
                  disabled={formerPropertyTable.length === 0}
                />
              )}
            </div>
            
            <TabsContent value="Tenants">
              {loadingTenantTable || loadingTenantSearch ? (
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
                      <TableHead className="rounded-tl-xl capitalize">Property name</TableHead>
                      <TableHead className='capitalize'>Full name</TableHead>
                      <TableHead className='capitalize'>Contact</TableHead>
                      <TableHead className='capitalize'>Occupancy date</TableHead>
                      <TableHead className='capitalize'>Renewal date</TableHead>
                      <TableHead className='capitalize'>Status</TableHead>
                      <TableHead className="rounded-tr-2xl capitalize">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  {
                  TenantTable.length !== 0 &&
                    (
                      <TableBody>
                        {TenantTable.map((tenant, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium capitalize">
                              {ReduceTextLength(tenant?.property_name, 15)}
                            </TableCell>
                            <TableCell className='capitalize'>
                              {ReduceTextLength(tenant?.full_name, 15)}
                            </TableCell>
                            <TableCell className='capitalize'>{tenant?.phone}</TableCell>
                            <TableCell className='capitalize'>{tenant?.move_in && format(new Date(tenant?.move_in), "dd MMM yyyy")}</TableCell>
                            <TableCell className='capitalize'>{tenant?.renewal_date && format(new Date(tenant?.renewal_date), "dd MMM yyyy")}</TableCell>
                            <TableCell className='capitalize'><TenentStatus status={tenant?.Active_tenant}/></TableCell>
                            <TableCell className='capitalize text-center bg-muted/30'>
                                <Link href={`/dashboard/tenant-management/tenant-info/${tenant?.tenant_id}`}>
                                    <Button variant={'ghost'}>View</Button>
                                </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    )
                  }
                  
                </Table>

                {TenantTable.length === 0 &&
                  <div className='flex flex-col items-center justify-center min-h-[58vh] w-full'>
                    {searchTenants ? (
                      <NotFound imageStyle='size-14' title='No Tenant found' desc='Try a different search'/>
                    ) : (
                      <NotFound imageStyle='size-14' title='No Tenant found' desc='You haven’t added any tenants yet'/>
                    )}
                  </div>
                }

                {
                  TenantTable.length !== 0 && !searchTenants &&
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
            </TabsContent>
            <TabsContent value="Properties">
              {loadingPropertyTable || loadingPropertySearch ? (
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
                        <TableHead className="rounded-tl-xl capitalize">Property name</TableHead>
                        <TableHead className='capitalize'>Location</TableHead>
                        <TableHead className='capitalize'>Property Type</TableHead>
                        <TableHead className='capitalize'>N0. of Rooms</TableHead>
                        <TableHead className='capitalize'>N0. of Flats</TableHead>
                        <TableHead className="rounded-tr-2xl capitalize">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    {
                    PropertyTable.length !== 0 &&
                      (
                        <TableBody>
                          {PropertyTable.map((property, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium capitalize">
                                 {ReduceTextLength(property?.property_name, 20)}
                              </TableCell>
                              <TableCell className='capitalize'>
                                {ReduceTextLength(property?.address, 20)}
                              </TableCell>
                              <TableCell className='capitalize'>{ReduceTextLength(property?.house_type, 15)}</TableCell>
                              <TableCell className='capitalize'>{property?.number_of_rooms}</TableCell>
                              <TableCell className='capitalize'>{property?.number_of_flats}</TableCell>
                              <TableCell className='capitalize text-center bg-muted/30'>
                                  <Link href={`/dashboard/tenant-management/property-info/${property?.house_id}`}>
                                      <Button variant={'ghost'}>View</Button>
                                  </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      )
                    }
                  
                </Table>

                {PropertyTable.length === 0 &&
                  <div className='flex flex-col items-center justify-center min-h-[58vh] w-full'>
                    {searchProperties ? (
                      <NotFound imageStyle='size-14' title='No Properties found' desc='Try a different search'/>
                    ) : (
                      <NotFound imageStyle='size-14' title='No Properties found' desc='You haven’t added any properties yet'/>
                    )}
                  </div>
                }

                {
                  PropertyTable.length !== 0 && !searchProperties &&
                  (
                    <div className='flex gap-2 items-center justify-between w-full my-2'>
                      <div className='flex gap-2 items-center justify-between'>
                          <Select value={propertyPageSize.toString()} onValueChange={(val) => {
                            setPropertyPageSize(Number(val)); 
                            setPropertyPage(1)
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
                          disabled={propertyPage <= 1}
                          onClick={() => setPropertyPage(prev => Math.max(prev - 1, 1))}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <Button variant={'ghost'} className='bg-red-500/10 text-red-700 border-0 font-semibold'>{propertyPage}</Button>
                        <button
                          className='px-1'
                          disabled={propertyPage >= Math.ceil(propertyCount / propertyPageSize)}
                          onClick={() => setPropertyPage(prev => prev + 1)}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                </div>
                  )
                }
              </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
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
    </div>
  )
}
