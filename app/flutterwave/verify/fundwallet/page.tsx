import { Suspense, lazy } from "react"
import LoadingPage from "@/components/LoadingPage"

// Use React.lazy instead of next/dynamic
const VerifyFundWallet = lazy(() =>
  import("./VerifyFundWallet")
)

export default function FundWalletVerifyPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <VerifyFundWallet />
    </Suspense>
  )
}
