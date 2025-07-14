import { LoginForm } from "@/components/forms/LoginForm"
import OnBoarding from "@/components/OnBoarding"

export default function LoginPage() {
  return (
    <OnBoarding image="/boarding1.jpeg" formComponent={<LoginForm/>}/>
  )
}
