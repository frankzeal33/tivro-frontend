"use client"

export const dynamic = "force-dynamic"; // disables static rendering for this route

import { NewPasswordForm } from "@/components/forms/NewPasswordForm"
import LoadingPage from "@/components/LoadingPage";
import OnBoarding from "@/components/OnBoarding"
import { Suspense } from "react";

export default function NewPassword() {
  return (
    <OnBoarding image="/new-password.png" 
      formComponent={
      <Suspense fallback={<LoadingPage />}>
        <NewPasswordForm/>
      </Suspense>}/>
  )
}