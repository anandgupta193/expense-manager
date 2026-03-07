import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import AppShell from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Manager",
  description: "Track and manage your daily expenses",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Expense Manager",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
