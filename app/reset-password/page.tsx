import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm"
import OnBoarding from "@/components/OnBoarding"

export default function ResetPassword() {
  return (
    <OnBoarding image="/reset.png" formComponent={<ResetPasswordForm/>}/>
  )
}