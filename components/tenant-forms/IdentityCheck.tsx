"use client"
import {
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
import { Input } from "../ui/input"
import FormCardHeader from "./FormCardHeader"
import { Label } from "../ui/label"
import FormCardFooter from "./FormCardFooter"
import { useGlobalContext } from "@/context/GlobalContext"
import { FormEvent, useState } from "react"
import { toast } from "react-toastify"
import { z } from "zod"
import { axiosClient } from "@/GlobalApi"
import { useTenantStore } from "@/store/TenantStore"
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
import { Button } from "../ui/button"

const IdSchema = z.object({
  IdType: z.string().min(1, "Select Identity Method"),
  IdNumber: z
    .string()
    .min(1, "ID Number is required")
    .regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
})

type IdFormValues = z.infer<typeof IdSchema>

const  IdentityCheck = () => {

  const {
      setCurrentSection,
      otp,
      identityCheck,
      setIdentityCheck,
      formProgress,
      setFormProgress,
      employmentInfo,
      setEmploymentInfo,
      setOtp
  } = useGlobalContext();
  const tenantInfo = useTenantStore((state) => state.tenantInfo)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<IdFormValues>({
    IdType: "",
    IdNumber: "",
  })
  const [open, setOpen] = useState(false)

      const openModal = () => {
        const result = IdSchema.safeParse(form)
              
        if (!result.success) {
          const fieldErrors: Partial<Record<keyof IdFormValues, string>> = {};
          result.error.errors.forEach((err) => {
              const field = err.path[0] as keyof IdFormValues
              fieldErrors[field] = err.message
          })
          toast.error(Object.values(fieldErrors)[0]);
          return
        }

        setOpen(true)
      }
  

  const handleSubmit = async () => {

    const result = IdSchema.safeParse(form)
              
      if (!result.success) {
          const fieldErrors: Partial<Record<keyof IdFormValues, string>> = {};
          result.error.errors.forEach((err) => {
            const field = err.path[0] as keyof IdFormValues
            fieldErrors[field] = err.message
          })
          toast.error(Object.values(fieldErrors)[0]);
          return
      }

      try {

          setIsSubmitting(true)

          const data = {
            bvn: form.IdNumber,
            token: tenantInfo.user_token
          }
          
          const result = await axiosClient.post("/credit/check/", data)

          if(result.status === 200){
            toast.success(result.data?.message);

            setCurrentSection("credit-check")
            setFormProgress(51)
            setFormProgress({...formProgress, fraction: "3/6",  percent: 51})
            setIdentityCheck({...identityCheck, completed: true,  iscurrentForm: false})
            setOtp({...otp,  iscurrentForm: true})
          }else if(result.status === 201){
            toast.success(result.data?.message);

            setCurrentSection("employment-check")
            setFormProgress({...formProgress, fraction: "4/6",  percent: 68})
            setIdentityCheck({...identityCheck, completed: true,  iscurrentForm: false})
            setOtp({...otp, completed: true,  iscurrentForm: false})
            setEmploymentInfo({...employmentInfo,  iscurrentForm: true})
          }else{
            toast.error(result.data?.message);
            setCurrentSection("Begin tenant verification")
          }

      } catch (error: any) {
        
        if(error.response.status === 500){
          toast.error("check bvn or contact support");
        }else{
          toast.error(error.response?.data?.message);
        }

      } finally {
        setIsSubmitting(false)
        setOpen(false)
      } 
  }
  
return (
  <div className="shadow-none max-w-96">
          <FormCardHeader title="Identity check" desc="We request a user’s Bank Verification Number (BVN) for verification, credit check and security purposes."/>
          <form className="flex flex-col gap-6">
              <CardContent className="px-4 py-2">
                  <div className="grid gap-6">
                      <div className='grid gap-6'>
                          <div className="grid gap-2">
                              <Label htmlFor="email">Select ID method*</Label>
                              <Select onValueChange={(value) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        IdType: value
                                    }));
                                  }}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="---Select---" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="Bank verification number">Bank verification number (BVN)</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="id">Enter identification number*</Label>
                              <Input id="id" type="number" placeholder="e.g 1234567890" value={form.IdNumber} onChange={(e: any) => setForm({ ...form, IdNumber: e.target.value})} />
                              {/* <p className="text-xs text-negative">Incorrect BVN. Try again!</p> */}
                          </div>
                      </div>

                      <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                            <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                                <AlertDialogTitle className="text-sm">Confirm your BVN</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogDescription className="bg-light px-4 py-6 flex flex-col items-center justify-center gap-3">
                                <span>Please confirm that the BVN you’ve provided is correct before proceeding.</span>
                                <span className="text-lg text-secondary-foreground">{form.IdNumber}</span>
                            </AlertDialogDescription>
                            <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                                <AlertDialogCancel className='w-[50%] bg-light'>Cancel</AlertDialogCancel>
                                <Button loading={isSubmitting} disabled={isSubmitting} onClick={handleSubmit} type="button" className='w-[50%]'>
                                    {isSubmitting ? "Loading..." : "Proceed"}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                      
                  </div>
              </CardContent>
              <FormCardFooter type="button" text="Proceed" handleClick={openModal}/>
          </form>
        </div>
)
}

export default IdentityCheck