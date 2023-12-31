import "./globals.css";
import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";

import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";

export const metadata = {
  title: "Breaddit",
  description: "A Reddit clone built with NextJS 13",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className
      )}
    >
      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <QueryProvider>
          <AuthSessionProvider>
            <Navbar />
            {authModal}
            <div className="container max-w-7xl  h-full pt-12">{children}</div>
            <Toaster />
          </AuthSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
