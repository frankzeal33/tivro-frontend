"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ContainerTitle } from '@/components/ContainerTitle'

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import { X } from "lucide-react"
import {
  Card
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import PhoneInputWithCountrySelect from 'react-phone-number-input'
import { PiSealCheckFill } from "react-icons/pi";
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { z } from 'zod'
import SkeletonFull from '@/components/SkeletonFull'

type profileType = {
    first_name: string,
    email: string,
    phone: string,
    image: string,
    last_name: string
}

const profileSchema = z.object({
  first_name: z.string().min(1, "first name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.coerce.string()
    .regex(/^\d+$/, "Phone number must contain only digits")
    .refine((val) => {
      if (val.startsWith("0")) return val.length === 11;
      return val.length === 10;
    }, {
      message: "Phone number must be 11 digits if it starts with 0, otherwise 10 digits",
    })
    .transform((val) => (val.startsWith("0") ? val.slice(1) : val)),
});

const newEmailSchema = z.object({
  new_email: z.string().email("Invalid new email address"),
  password: z.string().min(1, "Password is required"),
})

const newPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8,  "New Password must be at least 8 characters")
      .regex(/[A-Z]/, "New Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "New Password must contain at least one special character"),

    confirmNewPassword: z.string().min(1, "Invalid confirm new password")
  })
  .refine(
    data => data.confirmNewPassword === data.newPassword,
    {
      path: ["confirmNewPassword"],   // put the error on this field
      message: "Confirm Password does not match"
    }
  )

  
type ProfileFormValues = z.infer<typeof profileSchema>

type NewEmailFormValues = z.infer<typeof newEmailSchema>

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>

const Page = () => {

    const [activeTab, setActiveTab] = useState("Personal information");
    const [open, setOpen] = useState(false);

    const [isGetting, setIsGetting] = useState(false)
    const [profile, setProfile] = useState<profileType>({
        first_name: "",
        email: "",
        phone: "",
        image: "",
        last_name: ""
    })
    const [originalProfile, setOriginalProfile] = useState<profileType>({
        first_name: "",
        email: "",
        phone: "",
        image: "",
        last_name: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
    const [isSubmittingOTP, setIsSubmittingOTP] = useState(false)
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
    const [staticEmail, setStaticEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [changeEmail, setChangeEmail] = useState({
        new_email: '',
        password: ''
    })
     const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    })
    const [fileName, setFileName] = useState<File | null>(null);
    const [filepreview, setFilePreview] = useState<string | null>(null);
    const arrayList = new Array(2).fill(null)
    
    const toggle = (value: string) => {
        if(value === 'next'){
            setActiveTab("Maintenance information")
        }else if(value === 'prev'){
            setActiveTab("Property information")
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
       const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];

        if (file) {

            const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
            
            if (file.size > maxSizeInBytes) {
                toast.error("File size must be less than 2MB");
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                toast.error("Only JPG, JPEG, or PNG files are allowed");
                return;
            }

            setFileName(file);

            // preview image/file
            const preview = URL.createObjectURL(file);
            setFilePreview(preview);
        }
    };

    const getProfile = async () => {

        try {

            setIsGetting(true)
            
            const response = await axiosClient.get("/view/profile/")
            
            setProfile({
                first_name: response.data.name,
                email: response.data.email,
                phone: response.data.phone,
                image: response.data.image,
                last_name: response.data.last_name
            })

            setOriginalProfile({
                first_name: response.data.name,
                email: response.data.email,
                phone: response.data.phone,
                image: response.data.image,
                last_name: response.data.last_name
            })

            setStaticEmail(response.data.email)

        } catch (error: any) {
            toast.error(error.response?.data?.error);

        } finally {
            setIsGetting(false)
        } 
    }

    useEffect(() => {
        getProfile()
    }, [])

    const hasChanges = () => {
        if (!originalProfile) return true;

        const current = JSON.stringify(profile);
        const original = JSON.stringify(originalProfile);

        return current !== original;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const result = profileSchema.safeParse(profile)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof ProfileFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof ProfileFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
            
        const profileData = new FormData();
        profileData.set('first_name', profile.first_name)
        profileData.set('last_name', profile.last_name)
        profileData.set('phone', profile.phone)

        if (fileName) {
            profileData.set('profile_pic', fileName);
        }

        if (!hasChanges() && !fileName) {
            return toast.success("No changes detected.")
        }

        try {
    
            setIsSubmitting(true)
            const result = await axiosClient.post("/update/profile/", profileData)
            toast.success(result.data.message);
            setFilePreview(null)
            setFileName(null)
            getProfile()
    
        } catch (error: any) {
            toast.error(error.response?.data?.message);
    
        } finally {
            setIsSubmitting(false)
        } 

    }

    const handleNewEmail = async (e: FormEvent) => {
        e.preventDefault()
        const result = newEmailSchema.safeParse(changeEmail)

        // if (!result.success) {
        
        //     if (!result.success) {
        //         const errorMessage = result.error.errors[0].message
        //         toast.error(errorMessage)
        //         return
        //     }
        // }

        if (!result.success) {
           const fieldErrors: Partial<{
                new_email: string;
                password: string;
            }> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof NewEmailFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        try {
    
            setIsSubmittingEmail(true)
            
            const result = await axiosClient.post("/update/email/opt/", changeEmail)
            toast.success(result.data.message);

            setOpen(true)
            setChangeEmail({
                new_email: '',
                password: ''
            })
    
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.response?.data?.error);
    
        } finally {
            setIsSubmittingEmail(false)
        } 
    }

    const verifyOTP = async (e: FormEvent) => {
        e.preventDefault()

        try {
            setIsSubmittingOTP(true)
            
            const result = await axiosClient.post(`/update/email/?otp=${otp}`)
            toast.success(result.data.message);

            setOpen(false)
            getProfile()
            setOtp("")
    
        } catch (error: any) {
            toast.error(error.response?.data?.message);
    
        } finally {
            setIsSubmittingOTP(false)
        } 
    }

    const handleNewPassword = async (e: FormEvent) => {
        e.preventDefault()
        const result = newPasswordSchema.safeParse(passwords)

         if (!result.success) {
           const fieldErrors: Partial<{
            oldPassword: string;
            newPassword: string;
            confirmNewPassword: string;
            }> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof NewPasswordFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        try {
    
            setIsSubmittingPassword(true)
            
            const result = await axiosClient.post("/change/password/", passwords)
            toast.success(result.data.message);

            setPasswords({
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            })
    
        } catch (error: any) {
            toast.error(error.response?.data?.message);
    
        } finally {
            setIsSubmittingPassword(false)
        } 
    }

  return (
    <div className='my-container space-y-4'>
        <ContainerTitle title='Profile' desc='Manage your personal information here'/>

        {isGetting ? (
            <div className="grid grid-col-1 gap-6">
                {arrayList.map((_, index) => (
                    <SkeletonFull key={index} />
                ))}
            </div>
        ) : (
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 bg-light border p-0 shadow-none">
                    <TabsTrigger value="Personal information" className='rounded-r-none bg-background text-xs md:text-sm'>Personal info</TabsTrigger>
                    <TabsTrigger value="Change email" className='rounded-none bg-background text-xs md:text-sm'>Change email</TabsTrigger>
                    <TabsTrigger value="Change password" className='rounded-l-none bg-background text-xs md:text-sm'>Change password</TabsTrigger>
                </TabsList>
                <TabsContent value="Personal information">
                    <Card className='w-full shadow-none mt-4 p-4'>
                        <div className='flex gap-4 flex-col md:flex-row items-start md:items-center'>
                            <div className='relative'>
                                <Avatar className='size-32 border border-gray'>
                                    <AvatarImage src={filepreview ? filepreview : profile.image} alt="TV" />
                                </Avatar>
                                <PiSealCheckFill size={30} className='text-primary absolute top-22 right-0'/>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <h3 className='2xl font-semibold'>Profile Picture</h3>
                                <p className="text-sm font-medium text-muted-foreground leading-none">This image will be displayed on your profile</p>
                                <Input id="picture" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg"/>
                                <Label htmlFor="picture" className="text-sm font-medium border cursor-pointer p-2 flex items-center justify-center max-w-[130px] rounded-md hover:bg-muted">
                                    Upload Picture
                                </Label>
                            </div>
                        </div>
                    </Card>
                    <Card className='w-full shadow-none mt-4 p-4'>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6">
                                <div className='grid gap-6 md:grid-cols-2'>
                                    <div className="grid gap-2">
                                        <Label htmlFor="firstname">First name</Label>
                                        <Input id="firstname" value={profile.first_name} type="text" onChange={(e: any) => setProfile({ ...profile, first_name: e.target.value})} placeholder="Enter first name here" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="lastname">Last name</Label>
                                        <Input id="lastname" value={profile.last_name} type="text" onChange={(e: any) => setProfile({ ...profile, last_name: e.target.value})} placeholder="Enter last name here" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input id="email" value={profile.email} type="email" placeholder="Email address" disabled className='bg-background' />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone no.</Label>
                                    <Input id="phone" value={profile.phone} type="number" onChange={(e: any) => setProfile({ ...profile, phone: e.target.value})} placeholder="Enter Phone no." />
                                    {/* <PhoneInputWithCountrySelect
                                        placeholder="Enter phone number"
                                        value={"+" + profile.phone}
                                        defaultCountry="NG"
                                        onChange={phone => setValue(phone)}
                                        className='border p-2 rounded-md text-sm focus:outline-0 w-full'
                                    /> */}
                                </div>
                        
                                <Button loading={isSubmitting} disabled={isSubmitting} type="submit" className='max-w-40'>
                                    {isSubmitting ? "Updating..." : "Update profile"}
                                </Button>
                                
                            </div>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="Change email">
                    <Card className='w-full shadow-none mt-4 p-4'>
                        <form onSubmit={handleNewEmail}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input id="email" type="email" value={staticEmail} placeholder="Email address" disabled className='bg-background'/>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="new-email">New email address</Label>
                                    <Input id="new-email" value={changeEmail.new_email} onChange={(e: any) => setChangeEmail({ ...changeEmail, new_email: e.target.value })} type="email" placeholder="Enter new email address" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="old-password">Confirm your password</Label>
                                    <Input id="old-password" value={changeEmail.password} onChange={(e) => setChangeEmail({ ...changeEmail, password: e.target.value })} type="password" placeholder="Enter your password"/>
                                </div>
                            
                        
                                <Button loading={isSubmittingEmail} disabled={isSubmittingEmail} type="submit" className='max-w-40' onClick={handleNewEmail}>
                                    {isSubmittingEmail ? "Updating..." : "Change email"}
                                </Button>
                                
                            </div>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="Change password">
                    <Card className='w-full shadow-none mt-4 p-4'>
                        <form onSubmit={handleNewPassword}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="old-password">Old password</Label>
                                    <Input id="old-password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} type="password" placeholder="Enter old password" required/>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="new-password">New password</Label>
                                    <Input id="new-password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} type="password" placeholder="Enter new password" required />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="cnew-password">Confirm new password</Label>
                                    <Input id="cnew-password" value={passwords.confirmNewPassword} onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })} type="password" placeholder="Confirm password" required />
                                </div>
                            
                        
                                <Button loading={isSubmittingPassword} disabled={isSubmittingPassword} type="submit" className='max-w-40' onClick={handleNewPassword}>
                                    {isSubmittingPassword ? "Updating..." : "Change password"}
                                </Button>
                                
                            </div>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        )}

        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="rounded-2xl p-0 w-[300px] gap-0">
                <form>
                    <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                        <AlertDialogTitle className="text-sm">Verify OTP</AlertDialogTitle>
                        <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                    </AlertDialogHeader>
                    <AlertDialogDescription className="w-full bg-light px-4 py-4 flex flex-col items-center justify-center gap-3">
                        <span className='grid gap-2 w-full'>
                            <span>Enter the confirmation code sent to <span className='text-accent-foreground'>{changeEmail.new_email}</span> to confirm this action</span>
                            <Input type='number' value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter code here" className='text-center'/>
                            {/* <span className='text-center text-sm'>Didn’t receive a code? <Button variant={'link'} className='p-0 text-primary font-medium'>Resend</Button></span> */}
                        </span>
                    </AlertDialogDescription>
                    <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                        <Button loading={isSubmittingOTP} disabled={otp.length < 6 || isSubmittingOTP} type="submit" className='w-full' onClick={verifyOTP}>
                            {isSubmittingOTP ? "Verifying..." : "Verify"}
                        </Button>
                        {/* <AlertDialogAction className='w-full' onClick={() => setOpen(true)}>Verify</AlertDialogAction> */}
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  )
}

export default Page