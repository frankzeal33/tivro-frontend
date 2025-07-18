import { Suspense, lazy } from "react"
import LoadingPage from "@/components/LoadingPage"

// Use React.lazy instead of next/dynamic
const VerifyInspectionPayment = lazy(() =>
  import("./VerifyInspectionPayment")
)

export default function FundWalletVerifyPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <VerifyInspectionPayment />
    </Suspense>
  )
}