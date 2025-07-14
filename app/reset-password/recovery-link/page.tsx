import { RecoveryLinkForm } from "@/components/forms/RecoveryLinkForm"
import OnBoarding from "@/components/OnBoarding"

export default function RecoveryLink() {
  return (
    <OnBoarding image="/verify.png" formComponent={<RecoveryLinkForm/>}/>
  )
}