"use client";

import { ThemeProvider } from "../providers/ThemeProvider";
import { Toaster } from "sonner";
import { ConvexProvider } from "../providers/ConvexProvider";
import AuthProvider from "../providers/AuthProvider";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { usePathname } from "next/navigation";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <AuthProvider>
      <ConvexProvider>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            {!isAuthPage && <Navbar />}
            <main className="flex-1">{children}</main>
            {!isAuthPage && <Footer />}
          </div>
          <Toaster />
        </ThemeProvider>
      </ConvexProvider>
    </AuthProvider>
  );
} 