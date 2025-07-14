import {
  CardContent,
  CardFooter,
 
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ChangeEvent, useState } from "react"
import { Button } from "../ui/button"
import { useGlobalContext } from "@/context/GlobalContext"
import { toast } from "react-toastify"
import { axiosClient } from "@/GlobalApi"
import { z } from "zod"
import { tenantValidationForm } from "@/utils/tenantValidationForm"
import ReduceTextLength from "@/utils/ReduceTextLength"
import { useTenantStore } from "@/store/TenantStore"
import { Loader2 } from "lucide-react"
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

const generalSchema = z.object({
  employment_status: z.string().min(1, "Select Employment Status"),
  employment_type: z.string().min(1, "Select Employment Type")
})

const employedCDetailsSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_address: z.string().min(1, "Company address is required"),
  line_manager_email: z.string().email("Invalid email address"),
})

const selfEmployedBDetailsSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  business_address: z.string().min(1, "Business address is required")
})

const unEmployedSchema = z.object({
  guarantor_name: z.string().min(1, "Guarantor name is required"),
  guarantor_address: z.string().min(1, "Guarantor address is required")
})

const freelanceSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_address: z.string().min(1, "Company address is required")
})

const studentSchema = z.object({
  guarantor_name: z.string().min(1, "Guarantor name is required"),
  guarantor_address: z.string().min(1, "Guarantor address is required")
})

const  EmploymentCheck = () => {

  const {
    setCurrentSection,
    apartmentInspection,
    setApartmentInspection,
    formProgress,
    setFormProgress,
    employmentInfo,
    setEmploymentInfo,
    identityCheck,
    otp,
    certificate,
    setOtp,
    setIdentityCheck,
    setCertificate
  } = useGlobalContext();

  const tenantInfo = useTenantStore((state) => state.tenantInfo)
  const [activeTab, setActiveTab] = useState("Employment status");
  const [loading, setLoading] = useState(false);
  const [loadingCAC, setLoadingCAC] = useState(false);
  const [CACStatus, setCACStatus] = useState(true);
  const [open, setOpen] = useState(false)

  const [generalForm, setGeneralForm] = useState({
    employment_status: "employed",
    employment_type: "",
  })

  //employed
  const [employedFormCompanydetails, setEmployedFormCompanydetails] = useState({
    company_name: "",
    company_address: "",
    line_manager_email: "",
  })
  const [employedCIDCard, setEmployedCIDCard] = useState<File | null>(null)
  const [employedLetter, setEmployedLetter] = useState<File | null>(null)

  //self employed
  const [selfEmployedBusinessDetails, setSelfEmployedBusinessDetails] = useState({
    business_name: "",
    business_address: ""
  })

  //self employed CAC
  const [selfEmployedCAC, setSelfEmployedCAC] = useState({
    registration_status: "registered",
    company_registration_number: "",
    company_registration_type: ""
  })

  const [selfEmployedProofOfBus, setSelfEmployedProofOfBus] = useState<File | null>(null)

  //unemployed
  const [unEmployedDetails, setUnEmployedDetails] = useState({
    guarantor_name: "",
    guarantor_address: ""
  })
  const [unEmployedProofOfID, setUnEmployedProofOfID] = useState<File | null>(null)

  //freelance
  const [freelanceDetails, setFreelenceDetails] = useState({
    company_name: "",
    company_address: ""
  })
  const [freelanceLetterOfE, setFreelanceLetterOfE] = useState<File | null>(null)

  //student
  const [studentDetails, setStudentDetails] = useState({
    guarantor_name: "",
    guarantor_address: ""
  })
  const [studentID, setStudentID] = useState<File | null>(null)

  const handleEmploymentStatusChange = (value: any) => {
    setGeneralForm({...generalForm, employment_status: value, employment_type: ""})

    //reset eveything to default
    //employed
    setEmployedFormCompanydetails({
      company_name: "",
      company_address: "",
      line_manager_email: "",
    })
    setEmployedCIDCard(null)
    setEmployedLetter(null)

    //self employed
    setSelfEmployedBusinessDetails({
      business_name: "",
      business_address: ""
    })
    setSelfEmployedCAC({
      registration_status: "registered",
      company_registration_number: "",
      company_registration_type: ""
    })
    setSelfEmployedProofOfBus(null)

    //unemployed
    setUnEmployedDetails({
      guarantor_name: "",
      guarantor_address: ""
    })
    setUnEmployedProofOfID(null)

    // freelance
    setFreelenceDetails({
      company_name: "",
      company_address: ""
    })
    setFreelanceLetterOfE(null)

    //student
    setStudentDetails({
      guarantor_name: "",
      guarantor_address: ""
    })
    setStudentID(null)

  }

  const handleCACStatusChange = (value: any) => {
    setSelfEmployedCAC({...selfEmployedCAC, registration_status: value, company_registration_number: "", company_registration_type: ""})

    //self employed
    setSelfEmployedBusinessDetails({
      business_name: "",
      business_address: ""
    })
    setSelfEmployedProofOfBus(null)

  }

  const handleRegTypeChange = (value: any) => {
    setSelfEmployedCAC({...selfEmployedCAC, company_registration_type: value})
  }

  const handleEmployedCIDCardChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

      if (file) {
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSizeInBytes) {
          toast.error("File size must be less than 5MB");
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          toast.error("Only JPG, JPEG, PNG, or PDF files are allowed");
          return;
        }

        setEmployedCIDCard(file);

      }
  };

  const handleEmployedLetter = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

      if (file) {
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSizeInBytes) {
          toast.error("File size must be less than 5MB");
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          toast.error("Only JPG, JPEG, PNG, or PDF files are allowed");
          return;
        }

        setEmployedLetter(file);

      }
  };

  const handleSelfEmployedProof = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];

      if (file) {
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSizeInBytes) {
          toast.error("File size must be less than 5MB");
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          toast.error("Only JPG, JPEG, PNG, or PDF files are allowed");
          return;
        }

        setSelfEmployedProofOfBus(file);

      }
  };

  const handleUnEmployedProof = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

      if (file) {
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSizeInBytes) {
          toast.error("File size must be less than 5MB");
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          toast.error("Only JPG, JPEG, PNG, or PDF files are allowed");
          return;
        }

        setUnEmployedProofOfID(file);

      }
  };
 
  const handleFreelanceProof = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

      if (file) {
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSizeInBytes) {
          toast.error("File size must be less than 5MB");
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          toast.error("Only JPG, JPEG, PNG, or PDF files are allowed");
          return;
        }

        setFreelanceLetterOfE(file);

      }
  };

  const handleStudentProof = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

      if (file) {
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSizeInBytes) {
          toast.error("File size must be less than 5MB");
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          toast.error("Only JPG, JPEG, PNG, or PDF files are allowed");
          return;
        }

        setStudentID(file);

      }
  };

  const handleTabChange = (tab: string) => {

    if(tab === "Employment status"){

      setActiveTab(tab)
    }else if(tab === "Company details"){

      const result = tenantValidationForm(generalSchema, generalForm, "employment-form-error");
      if (!result.success) return;

      setActiveTab(tab)
    }else if(tab === "Uploads"){

      const result = tenantValidationForm(generalSchema, generalForm, "employment-form-error");
      if (!result.success) return;

      if(generalForm.employment_status === "employed"){

        const details = tenantValidationForm(employedCDetailsSchema, employedFormCompanydetails, "employment-form-error");
        if (!details.success) return;

      }else if(generalForm.employment_status === "self-employed"){

        if(selfEmployedCAC.registration_status === "registered"){

          if(!selfEmployedBusinessDetails.business_name || !selfEmployedBusinessDetails.business_address){
            return toast.error("Input and Verify CAC to Continue", {toastId: "employment-form-error"})
          }

        }else{
          const details = tenantValidationForm(selfEmployedBDetailsSchema, selfEmployedBusinessDetails, "employment-form-error");
          if (!details.success) return;
        }


      }else if(generalForm.employment_status === "unemployed"){

        const details = tenantValidationForm(unEmployedSchema, unEmployedDetails, "employment-form-error");
        if (!details.success) return;

      }else if(generalForm.employment_status === "freelance"){

        const details = tenantValidationForm(freelanceSchema, freelanceDetails, "employment-form-error");
        if (!details.success) return;

      }else{
        const details = tenantValidationForm(studentSchema, studentDetails, "employment-form-error");
        if (!details.success) return;
      }

      setActiveTab(tab)
    }
    
  };

  const handletoggle = (value: string) => {
    if(value === 'next'){
      if(activeTab === 'Company details'){

        if(generalForm.employment_status === "employed"){

          const details = tenantValidationForm(employedCDetailsSchema, employedFormCompanydetails);
          if (!details.success) return;

        }else if(generalForm.employment_status === "self-employed"){

          if(selfEmployedCAC.registration_status === "registered"){

            if(!selfEmployedBusinessDetails.business_name || !selfEmployedBusinessDetails.business_address){
              return toast.error("Input and Verify CAC to Continue")
            }

          }else{
            const details = tenantValidationForm(selfEmployedBDetailsSchema, selfEmployedBusinessDetails);
            if (!details.success) return;
          }
          
        }else if(generalForm.employment_status === "unemployed"){

          const details = tenantValidationForm(unEmployedSchema, unEmployedDetails);
          if (!details.success) return;

        }else if(generalForm.employment_status === "freelance"){

          const details = tenantValidationForm(freelanceSchema, freelanceDetails);
          if (!details.success) return;

        }else{

          const details = tenantValidationForm(studentSchema, studentDetails);
          if (!details.success) return;

        }

        setActiveTab("Uploads")
      }else if(activeTab === 'Uploads'){
        if(generalForm.employment_status === "employed"){

          if(!employedCIDCard){
            return toast.error("Upload your company ID Card");
          }

        }else if(generalForm.employment_status === "self-employed"){

        }else if(generalForm.employment_status === "unemployed"){

        }else if(generalForm.employment_status === "freelance"){

        }else{

        }
        submitData()

      }else{
        setActiveTab("Employment status")
      }
        
    }else if(value === 'prev'){
      if(activeTab === 'Company details'){
        setActiveTab("Employment status")
      }else if(activeTab === 'Uploads'){
        setActiveTab("Company details")
      }else{
        setActiveTab("Employment status")
      }
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()

    const result = tenantValidationForm(generalSchema, generalForm);
    if (!result.success) return;

    setActiveTab("Company details")
  }

  const submitData = () => {

    if(generalForm.employment_status === "employed"){
      submitEmployed()
    }else if(generalForm.employment_status === "self-employed"){
      submitSelfEmployed()
    }else if(generalForm.employment_status === "unemployed"){
      submitUnEmployed()
    }else if(generalForm.employment_status === "freelance"){
      submitFreelance()
    }else{
      submitStudent()
    }

  }

  const submitEmployed = async () => {

    try {
    
      setLoading(true)

      const employedData = new FormData();
      employedData.set('token', tenantInfo?.user_token)
      employedData.set('employment_status', generalForm.employment_status)
      employedData.set('employment_type', generalForm.employment_type)
      employedData.set('company_name', employedFormCompanydetails.company_name)
      employedData.set('company_address', employedFormCompanydetails.company_address)
      employedData.set('line_manager_email', employedFormCompanydetails.line_manager_email)
      
      if (employedCIDCard) {
        employedData.set('id_card', employedCIDCard);
      }

      if (employedLetter) {
        employedData.set('employment_letter', employedLetter);
      }

      const response = await axiosClient.post(`/employed/status/`, employedData)

      gotoNext(response)
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail);
    } finally {
      setLoading(false)
    } 
  }

  const submitSelfEmployed = async () => {

    try {
    
      setLoading(true)

      const selfEmployedData = new FormData();
      selfEmployedData.set('token', tenantInfo?.user_token)
      selfEmployedData.set('employment_status', generalForm.employment_status)
      selfEmployedData.set('employment_type', generalForm.employment_type)
      selfEmployedData.set('company_name', selfEmployedBusinessDetails.business_name)
      selfEmployedData.set('company_address', selfEmployedBusinessDetails.business_address)
      
      if (selfEmployedProofOfBus) {
        selfEmployedData.set('proof_of_business', selfEmployedProofOfBus);
      }

      const response = await axiosClient.post(`/selfemployed/status/`, selfEmployedData)

      gotoNext(response.status)
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail);
    } finally {
      setLoading(false)
    } 
  }

  const submitUnEmployed = async () => {

    try {
    
      setLoading(true)

      const unEmployedData = new FormData();
      unEmployedData.set('token', tenantInfo?.user_token)
      unEmployedData.set('employment_status', generalForm.employment_status)
      unEmployedData.set('employment_type', generalForm.employment_type)
      unEmployedData.set('previous_company_name', unEmployedDetails.guarantor_name)
      unEmployedData.set('company_address', unEmployedDetails.guarantor_address)
      
      if (unEmployedProofOfID) {
        unEmployedData.set('proof_of_work', unEmployedProofOfID);
      }

      const response = await axiosClient.post(`/unemployed/status/`, unEmployedData)

      gotoNext(response.status)
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail);
    } finally {
      setLoading(false)
    } 
  }

  const submitFreelance = async () => {

    try {
    
      setLoading(true)

      const freelanceData = new FormData();
      freelanceData.set('token', tenantInfo?.user_token)
      freelanceData.set('employment_status', generalForm.employment_status)
      freelanceData.set('employment_type', generalForm.employment_type)
      freelanceData.set('company_name', freelanceDetails.company_name)
      freelanceData.set('company_address', freelanceDetails.company_address)
      
      if (freelanceLetterOfE) {
        freelanceData.set('proof_of_work', freelanceLetterOfE);
      }

      const response = await axiosClient.post(`/freelancer/status/`,freelanceData)

      gotoNext(response.status)
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail);
    } finally {
      setLoading(false)
    } 
  }

  const submitStudent = async () => {

    try {
    
      setLoading(true)

      const studentData = new FormData();
      studentData.set('token', tenantInfo?.user_token)
      studentData.set('employment_status', generalForm.employment_status)
      studentData.set('employment_type', generalForm.employment_type)
      studentData.set('school_name', studentDetails.guarantor_name)
      studentData.set('school_address', studentDetails.guarantor_address)
      
      if (studentID) {
        studentData.set('proof_of_id', studentID);
      }

      const response = await axiosClient.post(`/student/status/`,studentData)

      gotoNext(response.status)
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail);
    } finally {
      setLoading(false)
    } 
  }

  const gotoNext = (response: any) => {
    if(response.status === 200){
      toast.success(response.data?.message);

      setCurrentSection("verify-apartment")
      setFormProgress({...formProgress, fraction: "5/6",  percent: 90})
      setEmploymentInfo({...employmentInfo, completed: true,  iscurrentForm: false})
      setApartmentInspection({...apartmentInspection, iscurrentForm: true})
    }else if(response.status === 201){
      toast.success(response.data?.message);

      setCurrentSection("certificates")
      setFormProgress({...formProgress, fraction: "6/6",  percent: 100})
      setApartmentInspection({...apartmentInspection, completed: true,  iscurrentForm: false})
      setCertificate({...certificate,  completed: true, iscurrentForm: true})

    }else{
      toast.error(response.data?.message);
      setCurrentSection("credit-check")
      setFormProgress(51)
      setFormProgress({...formProgress, fraction: "3/6",  percent: 51})
      setIdentityCheck({...identityCheck, completed: true,  iscurrentForm: false})
      setOtp({...otp,  iscurrentForm: true})
    }
  }

  const confirmCAC = () => {

    if(!selfEmployedCAC.company_registration_type){
      return toast.error("Select Registration Type");
    }

    if(!selfEmployedCAC.company_registration_type){
      return toast.error("Input Registration Number");
    }

    setOpen(true)
  }

  const verifyCAC = async () => {

    try {
    
      setLoadingCAC(true)

      const CACData = {
        company_registration_number: selfEmployedCAC.company_registration_number,
        company_registration_type: selfEmployedCAC.company_registration_type
      }

      const response = await axiosClient.post(`/cac/status/`, CACData)

      setSelfEmployedBusinessDetails({
        ...selfEmployedBusinessDetails,
        business_name: response.data?.company_name,
        business_address: response.data?.company_address
      })

    } catch (error: any) {
      toast.error(error.response?.data?.message);
      setSelfEmployedCAC({
        ...selfEmployedCAC,
        registration_status: "not-registered"
      })
    } finally {
      setLoadingCAC(false)
      setOpen(false)
      setCACStatus(false)
    } 
  }

return (
  <div className="shadow-none max-w-96">
          <FormCardHeader title="Employment information" desc="Kindly provide your verification details below"/>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <CardContent className="px-4 py-2">
                  <div className="grid gap-6">
                    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange}>
                      <TabsList className="grid grid-cols-3 bg-light border p-0 shadow-none mb-5">
                        <TabsTrigger value="Employment status" className='rounded-r-none bg-background text-xs p-2'>Employment</TabsTrigger>
                        <TabsTrigger value="Company details" className='rounded-none bg-background text-xs p-2'>Company details</TabsTrigger>
                        <TabsTrigger value="Uploads" className='rounded-l-none bg-background text-xs p-2'>Uploads</TabsTrigger>
                      </TabsList>
                      <TabsContent value="Employment status">
                        <div className="grid gap-6">
                          <div className='grid gap-6'>
                              <div className="grid gap-2">
                                  <Label>Select employment status*</Label>
                                  <Select value={generalForm.employment_status} onValueChange={handleEmploymentStatusChange}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="---Select---" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectItem value="employed">Employed</SelectItem>
                                        <SelectItem value="self-employed">Self-employed</SelectItem>
                                        <SelectItem value="unemployed">Unemployed</SelectItem>
                                        <SelectItem value="freelance">Freelance</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                              </div>
                              <div className="grid gap-2">
                                  <Label htmlFor="id">Select employment type*</Label>
                                  <Select value={generalForm.employment_type} onValueChange={(value) => setGeneralForm({...generalForm, employment_type: value})}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="---Select---" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {generalForm.employment_status === "employed" ? (
                                        <SelectGroup>
                                          <SelectItem value="Full-time">Full-time</SelectItem>
                                          <SelectItem value="Part-time">Part-time</SelectItem>
                                          <SelectItem value="Contract">Contract</SelectItem>
                                          <SelectItem value="Freelance">Freelance</SelectItem>
                                        </SelectGroup>
                                      ) : generalForm.employment_status === "self-employed" ? (
                                        <SelectGroup>
                                          <SelectItem value="CEO">CEO</SelectItem>
                                          <SelectItem value="Partner">Partner</SelectItem>
                                        </SelectGroup>
                                      ) : generalForm.employment_status === "unemployed" ? (
                                        <SelectGroup>
                                          <SelectItem value="freelance">freelance</SelectItem>
                                        </SelectGroup>
                                      ) : generalForm.employment_status === "freelance" ? (
                                        <SelectGroup>
                                          <SelectItem value="freelancer">freelancer</SelectItem>
                                        </SelectGroup>
                                      ) : (
                                        <SelectGroup>
                                          <SelectItem value="student">student</SelectItem>
                                          <SelectItem value="freelancer">freelancer</SelectItem>
                                        </SelectGroup>
                                      )}
                                      
                                    </SelectContent>
                                  </Select>
                              </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="Company details">
                        <div className="grid gap-6">
                          {generalForm.employment_status === "employed" ? (
                            <div className='grid gap-6'>
                              <div className="grid gap-2">
                                  <Label htmlFor="cname">Company name</Label>
                                  <Input id="cname" type="text" placeholder="e.g. Tivro Logistics"  value={employedFormCompanydetails.company_name} onChange={(e: any) => setEmployedFormCompanydetails({ ...employedFormCompanydetails, company_name: e.target.value})} />
                              </div>
                              <div className="grid gap-2">
                                  <Label htmlFor="address">Company address</Label>
                                  <Input id="address" type="text" placeholder="e.g.  5 toyin road, Ikeja, Lagos, Nigeria" value={employedFormCompanydetails.company_address} onChange={(e: any) => setEmployedFormCompanydetails({ ...employedFormCompanydetails, company_address: e.target.value})} />
                              </div>
                              <div className="grid gap-2">
                                  <Label htmlFor="email">Line manager email</Label>
                                  <Input id="email" type="email" placeholder="e.g. example@gmail.com" value={employedFormCompanydetails.line_manager_email} onChange={(e: any) => setEmployedFormCompanydetails({ ...employedFormCompanydetails, line_manager_email: e.target.value})} />
                              </div>
                            </div>
                          ) : generalForm.employment_status === "self-employed" ? (
                            <div className='grid gap-6'>
                              {CACStatus && (
                                <div className="grid gap-2">
                                    <Label>Registration status*</Label>
                                    <Select value={selfEmployedCAC.registration_status} onValueChange={handleCACStatusChange}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="---Select---" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectGroup>
                                          <SelectItem value="registered">Registered</SelectItem>
                                          <SelectItem value="not-registered">Not Registered</SelectItem>
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                </div>
                              )}
                              {selfEmployedCAC.registration_status === "registered" ? (
                                <>
                                {(!selfEmployedBusinessDetails.business_name || !selfEmployedBusinessDetails.business_address) && (
                                  <>
                                    <div className="grid gap-2">
                                      <Label>Registration Type</Label>
                                      <Select value={selfEmployedCAC.company_registration_type} onValueChange={handleRegTypeChange}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="---Select---" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectGroup>
                                            <SelectItem value="BUSINESS_NAME">BUSINESS_NAME</SelectItem>
                                            <SelectItem value="COMPANY">COMPANY</SelectItem>
                                            <SelectItem value="INCORPORATED_TRUSTESS">INCORPORATED TRUSTESS</SelectItem>
                                            <SelectItem value="LIMITED_PARTNERSHIP">LIMITED PARTNERSHIP</SelectItem>
                                            <SelectItem value="LIMITED_LIABILITY_PARTNERSHIP">LIMITED LIABILITY PARTNERSHIP</SelectItem>
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="cac">CAC No.</Label>
                                      <div className="relative">
                                        <Input id="cac" type="number" placeholder="e.g. 123456" value={selfEmployedCAC.company_registration_number} onChange={(e: any) => setSelfEmployedCAC({ ...selfEmployedCAC, company_registration_number: e.target.value})} />
                                        {selfEmployedCAC.company_registration_number.length > 3 && (
                                          <button
                                            type="button"
                                            className="absolute top-1.5 right-1.5 text-white font-semibold text-xs px-2 py-1 rounded-sm bg-primary"
                                            onClick={confirmCAC}
                                          >
                                          Verify
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                                {selfEmployedBusinessDetails.business_name && (
                                  <>
                                    <div className="grid gap-2">
                                      <Label htmlFor="cname">Business name</Label>
                                      <Input id="cname" type="text" value={selfEmployedBusinessDetails.business_name} className="bg-background" disabled/>
                                      {selfEmployedBusinessDetails.business_name && (
                                        <p className="text-xs text-green-600">Successful</p>
                                      )}
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="address">Business address</Label>
                                      <Input id="address" type="text" value={selfEmployedBusinessDetails.business_address} className="bg-background" disabled/>
                                      {selfEmployedBusinessDetails.business_name && (
                                        <p className="text-xs text-green-600">Successful</p>
                                      )}
                                    </div>
                                  </>
                                )}
                                </>
                              ) : (
                                <div className='grid gap-6'>
                                  <div className="grid gap-2">
                                      <Label htmlFor="cname">Business name</Label>
                                      <Input id="cname" type="text" placeholder="e.g. Tivro Logistics" value={selfEmployedBusinessDetails.business_name} onChange={(e: any) => setSelfEmployedBusinessDetails({ ...selfEmployedBusinessDetails, business_name: e.target.value})} />
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="address">Business address</Label>
                                      <Input id="address" type="text" placeholder="e.g. 5 toyin road, Ikeja, Lagos, Nigeria" value={selfEmployedBusinessDetails.business_address} onChange={(e: any) => setSelfEmployedBusinessDetails({ ...selfEmployedBusinessDetails, business_address: e.target.value})} />
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : generalForm.employment_status === "unemployed" ? (
                            <div className='grid gap-6'>
                              <div className="grid gap-2">
                                  <Label htmlFor="cname">Guarantor Name</Label>
                                  <Input id="cname" type="text" placeholder="e.g. John Doe" value={unEmployedDetails.guarantor_name} onChange={(e: any) => setUnEmployedDetails({ ...unEmployedDetails, guarantor_name: e.target.value})} />
                              </div>
                              <div className="grid gap-2">
                                  <Label htmlFor="address">Guarantor Address</Label>
                                  <Input id="address" type="text" placeholder="e.g. 5 toyin road, Ikeja, Lagos, Nigeria" value={unEmployedDetails.guarantor_address} onChange={(e: any) => setUnEmployedDetails({ ...unEmployedDetails, guarantor_address: e.target.value})} />
                              </div>
                            </div>
                          ) : generalForm.employment_status === "freelance" ? (
                            <div className='grid gap-6'>
                              <div className="grid gap-2">
                                  <Label htmlFor="fname">Company name</Label>
                                  <Input id="fname" type="text" placeholder="e.g. Tivro Logistics"  value={freelanceDetails.company_name} onChange={(e: any) => setFreelenceDetails({ ...freelanceDetails, company_name: e.target.value})} />
                              </div>
                              <div className="grid gap-2">
                                  <Label htmlFor="faddress">Company address</Label>
                                  <Input id="faddress" type="text" placeholder="e.g.  5 toyin road, Ikeja, Lagos, Nigeria" value={freelanceDetails.company_address} onChange={(e: any) => setFreelenceDetails({ ...freelanceDetails, company_address: e.target.value})} />
                              </div>
                            </div>
                          ) : (
                            <div className='grid gap-6'>
                               <div className="grid gap-2">
                                  <Label htmlFor="stname">Guarantor Name</Label>
                                  <Input id="stname" type="text" placeholder="e.g. John Doe" value={studentDetails.guarantor_name} onChange={(e: any) => setStudentDetails({ ...studentDetails, guarantor_name: e.target.value})} />
                              </div>
                              <div className="grid gap-2">
                                  <Label htmlFor="staddress">Guarantor Address</Label>
                                  <Input id="staddress" type="text" placeholder="e.g. 5 toyin road, Ikeja, Lagos, Nigeria" value={studentDetails.guarantor_address} onChange={(e: any) => setStudentDetails({ ...studentDetails, guarantor_address: e.target.value})} />
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="Uploads">
                        {generalForm.employment_status === "employed" ? (
                          <div className='grid gap-6'>
                            <div className='grid gap-2'>
                              <Label htmlFor="card">Company ID card*</Label>
                              <Input id="cardId" className="hidden" type="file" onChange={handleEmployedCIDCardChange}/>
                              <Label htmlFor="cardId" className="text-sm font-medium border cursor-pointer flex items-center justify-between w-full rounded-md hover:bg-muted">
                                <div className="text-ring text-xs p-2">{employedCIDCard ? ReduceTextLength(employedCIDCard.name, 15) : "---Choose file---"}</div>
                                <div className="bg-muted px-4 py-2 rounded-r-md">Choose file</div>
                              </Label>
                              <p className="text-xs text-negative">{!employedCIDCard && "Upload document or an image format!"}</p>
                            </div>
                            <div className='grid gap-2'>
                              <Label htmlFor="letter">Employment letter (optional)</Label>
                              <Input id="eletter" className="hidden" type="file" onChange={handleEmployedLetter}/>
                              <Label htmlFor="eletter" className="text-sm font-medium border cursor-pointer flex items-center justify-between w-full rounded-md hover:bg-muted">
                                  <div className="text-ring text-xs p-2">{employedLetter ? ReduceTextLength(employedLetter.name, 15) : "---Choose file---"}</div>
                                  <div className="bg-muted px-4 py-2 rounded-r-md">Choose file</div>
                              </Label>
                              <p className="text-xs text-negative">{!employedLetter && "Upload document or an image format!"}</p>
                            </div>
                          </div>   
                          ) : generalForm.employment_status === "self-employed" ? (
                            <div className='grid gap-6'>
                              <div className='grid gap-2'>
                                <Label htmlFor="bprooflabel">Proof of business (Business location, Business card/Signpost)</Label>
                                <Input id="bproof" className="hidden" type="file" onChange={handleSelfEmployedProof}  accept="image/png, image/jpeg, image/jpg"/>
                                <Label htmlFor="bproof" className="text-sm font-medium border cursor-pointer flex items-center justify-between w-full rounded-md hover:bg-muted">
                                  <div className="text-ring text-xs p-2">{selfEmployedProofOfBus ? ReduceTextLength(selfEmployedProofOfBus.name, 15) : "---Choose file---"}</div>
                                  <div className="bg-muted px-4 py-2 rounded-r-md">Choose file</div>
                                </Label>
                                <p className="text-xs text-negative">{!selfEmployedProofOfBus && "Upload an image format!"}</p>
                              </div>
                            </div>   
                          ) : generalForm.employment_status === "unemployed" ? (
                            <div className='grid gap-6'>
                              <div className='grid gap-2'>
                                <Label htmlFor="ulabel">Upload proof of identity(Driving Licenses, passport or National ID)</Label>
                                <Input id="uid" className="hidden" type="file" onChange={handleUnEmployedProof} />
                                <Label htmlFor="uid" className="text-sm font-medium border cursor-pointer flex items-center justify-between w-full rounded-md hover:bg-muted">
                                  <div className="text-ring text-xs p-2">{unEmployedProofOfID ? ReduceTextLength(unEmployedProofOfID.name, 15) : "---Choose file---"}</div>
                                  <div className="bg-muted px-4 py-2 rounded-r-md">Choose file</div>
                                </Label>
                                <p className="text-xs text-negative">{!unEmployedProofOfID && "Upload a document or image format!"}</p>
                              </div>
                            </div>   
                          ) : generalForm.employment_status === "freelance" ? (
                           <div className='grid gap-6'>
                             <div className='grid gap-2'>
                                <Label htmlFor="Llabel">Letter of engagement</Label>
                                <Input id="Lid" className="hidden" type="file" onChange={handleFreelanceProof} />
                                <Label htmlFor="Lid" className="text-sm font-medium border cursor-pointer flex items-center justify-between w-full rounded-md hover:bg-muted">
                                  <div className="text-ring text-xs p-2">{freelanceLetterOfE ? ReduceTextLength(freelanceLetterOfE.name, 15) : "---Choose file---"}</div>
                                  <div className="bg-muted px-4 py-2 rounded-r-md">Choose file</div>
                                </Label>
                                <p className="text-xs text-negative">{!freelanceLetterOfE && "Upload a document or image format!"}</p>
                              </div>
                            </div>   
                          ) : (
                            <div className='grid gap-6'>
                              <div className='grid gap-2'>
                                <Label htmlFor="stlabel">Upload proof of identity(Driving Licenses, passport or National ID)</Label>
                                <Input id="stid" className="hidden" type="file" onChange={handleStudentProof} />
                                <Label htmlFor="stid" className="text-sm font-medium border cursor-pointer flex items-center justify-between w-full rounded-md hover:bg-muted">
                                  <div className="text-ring text-xs p-2">{studentID ? ReduceTextLength(studentID.name, 15) : "---Choose file---"}</div>
                                  <div className="bg-muted px-4 py-2 rounded-r-md">Choose file</div>
                                </Label>
                                <p className="text-xs text-negative">{!studentID && "Upload a document or image format!"}</p>
                              </div>
                            </div>   
                          )}                     
                      </TabsContent>
                  </Tabs>
                  </div>
              </CardContent>
              {activeTab === 'Employment status' ? (
                <FormCardFooter text="Next"/>
              ) : (
                <CardFooter  className="flex gap-2 items-center p-4 justify-between w-full border-t">
                  <Button variant={'outline'} type="button" className="w-[48%]" onClick={() => handletoggle('prev')}>Previous</Button>
                  <Button loading={activeTab === "Uploads" && loading} disabled={activeTab === "Uploads" && loading} className="w-[48%]" type="button" onClick={() => handletoggle('next')}>Next</Button>
                </CardFooter >
              )}

              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                    <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                        <AlertDialogTitle className="text-sm">Confirm your CAC</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription className="bg-light px-4 py-6 flex flex-col items-center justify-center gap-3">
                        <span>Please confirm that the CAC Number you’ve provided is correct before proceeding. Please Note that this is a one time check.</span>
                        <span className="text-lg text-secondary-foreground">{selfEmployedCAC.company_registration_number}</span>
                    </AlertDialogDescription>
                    <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                        <AlertDialogCancel className='w-[50%] bg-light'>Cancel</AlertDialogCancel>
                        <Button loading={loadingCAC} disabled={loadingCAC} onClick={verifyCAC} type="button" className='w-[50%]'>
                            {loadingCAC ? "Verifying..." : "Proceed"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
          </form>
        </div>
)
}

export default EmploymentCheck