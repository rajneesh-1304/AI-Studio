import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono, Inter, Lora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const loraFont = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  weight: ["400", "500"],
});

const dmSansFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AI Studio",
  icons: {
    icon: './header-logo.jpeg'
  },
  description: "",
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="en" suppressHydrationWarning
      >
        <body
          className={`font-sans ${loraFont.variable} ${dmSansFont.variable}`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={<div className="w-full h-16" />}>
              <Header />
            </Suspense>
            <main>  
              {children}
            </main>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
