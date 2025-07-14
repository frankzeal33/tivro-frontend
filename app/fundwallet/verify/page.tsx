import { Suspense, lazy } from "react"
import LoadingPage from "@/components/LoadingPage"

// Use React.lazy instead of next/dynamic
const VerifyNombaFund = lazy(() =>
  import("./VerifyNombaFund")
)

export default function FundWalletVerifyPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <VerifyNombaFund />
    </Suspense>
  )
}