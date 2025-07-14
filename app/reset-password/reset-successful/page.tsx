import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm"
import { ResetSuccessfulForm } from "@/components/forms/ResetSuccessfulForm"
import OnBoarding from "@/components/OnBoarding"

export default function ResetSuccessful() {
  return (
    <OnBoarding image="/reset-successful.png" formComponent={<ResetSuccessfulForm/>}/>
  )
}