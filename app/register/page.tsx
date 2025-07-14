import { RegisterForm } from "@/components/forms/RegisterForm"
import OnBoarding from "@/components/OnBoarding"

export default function RegisterPage() {
  return (
    <OnBoarding image="/boarding1.jpeg" formComponent={<RegisterForm/>}/>
  )
}