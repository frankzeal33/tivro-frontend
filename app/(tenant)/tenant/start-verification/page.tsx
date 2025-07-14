"use client"
import { cn } from "@/lib/utils"
import {
  Card
} from "@/components/ui/card"
import { useEffect, useState } from "react"
import RequestDetails from "@/components/tenant-forms/RequestDetails"
import IdentityCheck from "@/components/tenant-forms/IdentityCheck"
import CreditCheck from "@/components/tenant-forms/CreditCheck"
import EmploymentCheck from "@/components/tenant-forms/EmploymentCheck"
import VerifyApartment from "@/components/tenant-forms/VerifyApartment"
import Certificates from "@/components/tenant-forms/Certificates"
import { Progress } from "@/components/ui/progress"
import { useGlobalContext } from "@/context/GlobalContext"
import { useTenantStore } from "@/store/TenantStore"
import { useRouter } from "next/navigation"

const sections = [
    {
      section: "Begin tenant verification",
      desc: "Confirm request details"
    },
    {
      section: "Identity check",
      desc: "Provide your identity details"
    },
    {
      section: "credit-check",
      desc: "Provide OTP verification code"
    },
    {
      section: "employment-check",
      desc: "Provide employment information"
    },
    {
      section: "verify-apartment",
      desc: "Provide residential information"
    },
    {
      section: "certificates",
      desc: "Tenant verification complete"
    }
  ];

const Page = () => {

  const {
    requestDetails,
    identityCheck, 
    otp,
    employmentInfo,
    apartmentInspection, 
    currentSection,
    setCurrentSection,
    certificate,
    formProgress,
    setFormProgress,
    setApartmentInspection,
    setEmploymentInfo,
    setOtp,
    setIdentityCheck,
    setRequestDetails,
    handleRequestDetailsChange
  } = useGlobalContext();
  const router = useRouter()
  const tenantInfo = useTenantStore((state) => state.tenantInfo)

  useEffect(() => {
    if(!tenantInfo?.user_token){
      router.replace("/")
    }
  }, [])

  const renderStages = () => {
    switch (currentSection) {
      case "Begin tenant verification":
        return <RequestDetails />;
      case "Identity check":
        return <IdentityCheck />;
      case "credit-check":
        return <CreditCheck />;
      case "employment-check":
        return <EmploymentCheck />;
      case "verify-apartment":
        return <VerifyApartment />;
      case "certificates":
        return <Certificates />;
    }
  };

  const firstCircleColor = (section: string) => {
    switch (section) {
      case "Begin tenant verification":
        return requestDetails.iscurrentForm && "bg-primary/10"
      case "Identity check":
        return identityCheck.iscurrentForm && "bg-primary/10"
      case "credit-check":
        return otp.completed || otp.iscurrentForm && "bg-primary/10"
      case "employment-check":
        return employmentInfo.iscurrentForm && "bg-primary/10"
      case "verify-apartment":
        return apartmentInspection.iscurrentForm && "bg-primary/10"
      case "certificates":
        return certificate.iscurrentForm && "bg-primary/10"
    }
  };

  const secondCircleColor = (section: string) => {
    switch (section) {
      case "Begin tenant verification":
        return requestDetails.iscurrentForm ? "bg-primary border-primary" : requestDetails.completed ? "bg-light border-primary" : "bg-light border-gray"
      case "Identity check":
        return identityCheck.iscurrentForm ? "bg-primary border-primary" : identityCheck.completed ? "bg-light border-primary" : "bg-light border-gray"
      case "credit-check":
        return otp.iscurrentForm ? "bg-primary border-primary" : otp.completed ? "bg-light border-primary" : "bg-light border-gray"
      case "employment-check":
        return employmentInfo.iscurrentForm ? "bg-primary border-primary" : employmentInfo.completed ? "bg-light border-primary" : "bg-light border-gray"
      case "verify-apartment":
        return apartmentInspection.iscurrentForm ? "bg-primary border-primary" : apartmentInspection.completed ? "bg-light border-primary" : "bg-light border-gray"
      case "certificates":
        return certificate.iscurrentForm ? "bg-primary border-primary" : certificate.completed ? "bg-light border-primary" : "bg-light border-gray"
    }
  };

  const thirdCircleColor = (section: string) => {
    switch (section) {
      case "Begin tenant verification":
        return requestDetails.iscurrentForm ? "bg-light" : requestDetails.completed ? "bg-primary" : "bg-gray"
      case "Identity check":
        return identityCheck.iscurrentForm ? "bg-light" : identityCheck.completed ? "bg-primary" : "bg-gray"
      case "credit-check":
        return otp.iscurrentForm ? "bg-light" : otp.completed ? "bg-primary" : "bg-gray"
      case "employment-check":
        return employmentInfo.iscurrentForm ? "bg-light" : employmentInfo.completed ? "bg-primary" : "bg-gray"
      case "verify-apartment":
        return apartmentInspection.iscurrentForm ? "bg-light" : apartmentInspection.completed ? "bg-primary" : "bg-gray"
      case "certificates":
        return certificate.iscurrentForm ? "bg-light" : certificate.completed ? "bg-primary" : "bg-gray"
    }
  };

  const lineColor = (section: string) => {
    switch (section) {
      case "Begin tenant verification":
        return requestDetails.completed ? "bg-primary" : "bg-gray"
      case "Identity check":
        return identityCheck.completed ? "bg-primary" : "bg-gray"
      case "credit-check":
        return otp.completed ? "bg-primary" : "bg-gray"
      case "employment-check":
        return employmentInfo.completed ? "bg-primary" : "bg-gray"
      case "verify-apartment":
        return apartmentInspection.completed ? "bg-primary" : "bg-gray"
      case "certificates":
        return certificate.completed ? "bg-primary" : "bg-gray"
    }
  };

  const titleColor = (section: string) => {
    switch (section) {
      case "Begin tenant verification":
        return requestDetails.completed || requestDetails.iscurrentForm ? "text-primary" : "text-disabled"
      case "Identity check":
        return identityCheck.completed || identityCheck.iscurrentForm ? "text-primary" : "text-disabled"
      case "credit-check":
        return otp.completed || otp.iscurrentForm ? "text-primary" : "text-disabled"
      case "employment-check":
        return employmentInfo.completed || employmentInfo.iscurrentForm ? "text-primary" : "text-disabled"
      case "verify-apartment":
        return apartmentInspection.completed || apartmentInspection.iscurrentForm ? "text-primary" : "text-disabled"
      case "certificates":
        return certificate.completed || certificate.iscurrentForm ? "text-primary" : "text-disabled"
    }
  };

  const descColor = (section: string) => {
    switch (section) {
      case "Begin tenant verification":
        return requestDetails.completed || requestDetails.iscurrentForm ? "text-accent-foreground" : "text-disabled"
      case "Identity check":
        return identityCheck.completed || identityCheck.iscurrentForm ? "text-accent-foreground" : "text-disabled"
      case "credit-check":
        return otp.completed || otp.iscurrentForm ? "text-accent-foreground" : "text-disabled"
      case "employment-check":
        return employmentInfo.completed || employmentInfo.iscurrentForm ? "text-accent-foreground" : "text-disabled"
      case "verify-apartment":
        return apartmentInspection.completed || apartmentInspection.iscurrentForm ? "text-accent-foreground" : "text-disabled"
      case "certificates":
        return certificate.completed || certificate.iscurrentForm ? "text-accent-foreground" : "text-disabled"
    }
  };

  return (
    <div className="tenant-container">
        <div className="fixed w-full p-4 bg-light border-b top-[4rem] right-0 left-0 lg:hidden">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-ring">Step {formProgress.fraction}</p>
            <h4>{currentSection}</h4>
          </div>
          <Progress value={formProgress.percent} className="w-full" />
        </div>
        <div className={cn("grid lg:grid-cols-2 gap-3 lg:gap-6 items-start justify-center")}>
          <Card className="hidden lg:flex flex-col shadow-none max-w-80 p-4 gap-1">
            {sections.map((item: any, index: number) => (
                <div className="flex gap-2" key={index}>
                  <div className="flex flex-col gap-0.5 items-center">
                    <div className={`size-8 rounded-full flex items-center justify-center ${firstCircleColor(item.section)}`}>
                      <div className={`size-6 rounded-full border-2 flex items-center justify-center ${secondCircleColor(item.section)}`}>
                          <div className={`size-2 rounded-full  ${thirdCircleColor(item.section)}`}></div>
                      </div>
                    </div>
                    {index !== sections.length -1 && (
                      <div className={`h-10 w-0.5 ${lineColor(item.section)}`}></div>
                    )}
                  </div>
                  <div>
                      <h3 className={`font-medium text-base ${titleColor(item.section)}`}>{item.section}</h3>
                      <p className={`text-sm font-light ${descColor(item.section)}`}>{item.desc}</p>
                  </div>
                </div>
            ))}
          </Card>
          <Card className="shadow-none w-full max-w-[26rem] p-0">
            {renderStages()}
          </Card>
      </div>
    </div>
  )
}

export default Page