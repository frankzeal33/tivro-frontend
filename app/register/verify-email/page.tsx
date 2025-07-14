import { VerifyEmail } from "@/components/forms/VerifyEmail"
import LoadingPage from "@/components/LoadingPage"
import OnBoarding from "@/components/OnBoarding"
import { Suspense } from "react"


export default function RegisterPage() {
  return (
    <OnBoarding
      image="/verify.png"
      formComponent={
        <Suspense fallback={<LoadingPage />}>
          <VerifyEmail />
        </Suspense>
      }
    />
  )
}