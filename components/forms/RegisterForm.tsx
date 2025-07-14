"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { debounce } from "lodash"
import { axiosClient } from "@/GlobalApi"
import { toast } from "react-toastify"

const registerSchema = z.object({
  name: z.string().min(1, "first name is required"),
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
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {

  const router = useRouter()

  const [form, setForm] = useState<RegisterFormValues>({
    name: '',
    last_name: '',
    phone: '',
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormValues, boolean>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Debounced validation
  const validateForm = debounce((updatedForm: RegisterFormValues) => {
    const result = registerSchema.safeParse(updatedForm)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormValues
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
    } else {
      setErrors({})
    }
  }, 300)

  useEffect(() => {
    validateForm(form)
    return () => validateForm.cancel()
  }, [form])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const result = registerSchema.safeParse(form)

    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormValues
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setTouched({
        name: true,
        last_name: true,
        phone: true,
        email: true,
        password: true,
      })
      return
    }

    setErrors({})

    const removeFirstZero = form.phone.startsWith("0") ? form.phone.slice(1) : form.phone;
    const phoneNo = "234" + removeFirstZero;

    const data = {
      ...form,
      phone: Number(phoneNo)
    }
    
    try {

      setIsSubmitting(true)
      
      const result = await axiosClient.post("/register/", data)
      toast.success(result.data.message);

      router.push(`/register/verify-email?email=${encodeURIComponent(result.data.email)}`)
      setForm({
        name: '',
        last_name: '',
        phone: '',
        email: '',
        password: ''
      })

    } catch (error: any) {
      toast.error(error.response?.data?.message);

      if(error.response.data.message === "This email exists and it's verified. Kindly login" || error.response.data.message === "An account with this phone number already exists"){
        router.push("/login")
      }else if(error.response.data.message === "This email exists and it's not verified. Kindly verify the email"){
        try {
          const response = await axiosClient.post("/resend/token/", { email: form.email })

          toast.success(response.data.message)
          router.push(`/register/verify-email?email=${encodeURIComponent(form.email)}`)
        } catch (error: any) {
          toast.error(error.response?.data?.message)
        }
        
      }

    } finally {
      setIsSubmitting(false)
    } 
  }

  return (
    <form className={cn("flex flex-col gap-6")} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Get started with Tivro!</h1>
        <p className="text-balance text-sm font-normal">
        Kindly enter your details to get started
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="firstname">First Name</Label>
          <Input id="firstname" type="text" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value})} onBlur={() => setTouched((prev) => ({ ...prev, name: true }))} placeholder="Enter name here" />
          {touched.name && errors.name && (
            <p className="text-xs text-red-500">{errors.name}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastname">Last Name</Label>
          <Input id="lastname" type="text" value={form.last_name} onChange={(e: any) => setForm({ ...form, last_name: e.target.value})} onBlur={() => setTouched((prev) => ({ ...prev, last_name: true }))} placeholder="Enter last name here" />
          {touched.last_name && errors.last_name && (
            <p className="text-xs text-red-500">{errors.last_name}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone No.</Label>
          <Input id="phone" type="number" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value})} onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))} placeholder="E.g 08123456789" />
          {touched.phone && errors.phone && (
            <p className="text-xs text-red-500">{errors.phone}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value})} onBlur={() => setTouched((prev) => ({ ...prev, email: true }))} placeholder="Enter email address here" />
          {touched.email && errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e: any) => setForm({ ...form, password: e.target.value})} onBlur={() => setTouched((prev) => ({ ...prev, password: true }))} placeholder="*********************" className="pr-12" />
            <button
              type="button"
              className="absolute top-2 right-3 text-ring"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>
        <Button loading={isSubmitting} disabled={isSubmitting} type="submit" className="w-full">
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </Button>
      </div>
      <div className="text-sm">
        Don&apos;t have an account?{" "}
        <Link href={"/login"} className="underline underline-offset-4 text-primary font-medium hover:no-underline">
          Login
        </Link>
      </div>
    </form>
  )
}
