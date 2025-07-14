import { create } from "zustand";
import { persist } from "zustand/middleware";

type TenantInfoType = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    user_token: string;
};

type TenantStoreType = {
  tenantInfo: TenantInfoType;
  setTenantInfo: (tenant: TenantInfoType) => void;
  clearTenantInfo: () => void;
};

const defaultTenantInfo: TenantInfoType = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  user_token: "",
};

export const useTenantStore = create< TenantStoreType>()(
  persist(
    (set) => ({
      tenantInfo: defaultTenantInfo,
      setTenantInfo: (tenant) => set({ tenantInfo: tenant }),
      clearTenantInfo: () => set({ tenantInfo: defaultTenantInfo }),
    }),
    {
      name: "tenant", // key in localStorage
    }
  )
);

