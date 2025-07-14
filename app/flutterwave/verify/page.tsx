import { Suspense, lazy } from "react"
import LoadingPage from "@/components/LoadingPage"

// Use React.lazy instead of next/dynamic
const VerifySubscription = lazy(() =>
  import("./VerifySubscription")
)

export default function FundWalletVerifyPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <VerifySubscription />
    </Suspense>
  )
}