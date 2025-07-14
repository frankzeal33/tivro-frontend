import { Suspense, lazy } from "react"
import LoadingPage from "@/components/LoadingPage"

// Use React.lazy instead of next/dynamic
const VerifyNombaSubscription = lazy(() =>
  import("./VerifyNombaSubscription")
)

export default function FundWalletVerifyPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <VerifyNombaSubscription />
    </Suspense>
  )
}