"use client"
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";

  type tenantProps = {
    requestDetails: {};
    identityCheck: {}; 
    otp: {};
    employmentInfo: {};
    apartmentInspection: {};
  }

  const GlobalContext = createContext<tenantProps | any>({});
  
  export const GlobalContextProvider = ({ children }: {children: any}) => {

    const [currentSection, setCurrentSection] = useState("Begin tenant verification");
    const [formProgress, setFormProgress] = useState({
      fraction: "1/6",
      percent: 17
    })
  
    const [requestDetails, setRequestDetails] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      apartment: '',
      completed: false,
      iscurrentForm: true
    });

    const [identityCheck, setIdentityCheck] = useState({
      idMethod: '',
      idNumber: '',
      completed: false,
      iscurrentForm: false
    });

    const [otp, setOtp] = useState({
      otp: '',
      completed: false,
      iscurrentForm: false
    });

    const [employmentInfo, setEmploymentInfo] = useState({
      employmentStatus: '',
      employmentType: '',
      companyName: '',
      companyAddress: '',
      managerEmail: '',
      companyIdCard: '',
      employmentLetter: '',
      completed: false,
      iscurrentForm: false
    });

    const [apartmentInspection, setApartmentInspection] = useState({
      Inspection: false,
      completed: false,
      iscurrentForm: false
    });

    const [certificate, setCertificate] = useState({
      completed: false,
      iscurrentForm: false
    });

     // handle input change
      const handleRequestDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        name = name.trimStart()
        value = value.trimStart()


        setRequestDetails((prev: any) => ({ ...prev, [name]: value }));
      };

  
    return (
      <GlobalContext.Provider
        value={{
          requestDetails,
          identityCheck, 
          otp,
          employmentInfo,
          apartmentInspection, 
          certificate,
          currentSection,
          formProgress,
          setFormProgress,
          setCurrentSection,
          setCertificate,
          setApartmentInspection,
          setEmploymentInfo,
          setOtp,
          setIdentityCheck,
          setRequestDetails,
          handleRequestDetailsChange
          
        }}
      >
        {children}
      </GlobalContext.Provider>
    );
  };
  
  export const useGlobalContext = () => {
    return useContext(GlobalContext);
  };
  