import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from 'react-toastify';
import "./globals.css";
import 'react-phone-number-input/style.css'
import { GlobalContextProvider } from "@/context/GlobalContext";

const inter = Inter({
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Rental Management Software for Landlords and Tenants in Africa – Tivro",
  description: "Your trustworthy partner in rental verification, effortlessly verifying tenants or properties to ensure peace of mind and empower confident, informed decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <GlobalContextProvider>
          {children}
        </GlobalContextProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored" // This helps add background colors to types
        />
      </body>
    </html>
  );
}
