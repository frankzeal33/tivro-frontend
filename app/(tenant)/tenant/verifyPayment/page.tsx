import { Suspense, lazy } from "react"
import LoadingPage from "@/components/LoadingPage"

// Use React.lazy instead of next/dynamic
const VerifyTenantPayment = lazy(() =>
  import("./VerifyTenantPayment")
)

export default function FundWalletVerifyPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <VerifyTenantPayment />
    </Suspense>
  )
}