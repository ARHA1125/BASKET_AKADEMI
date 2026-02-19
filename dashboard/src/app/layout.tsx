import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import localFont from "next/font/local"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://wirabhakti.my.id"),
  title: "Wirabhakti Basketball Academy",
  description: "Basket akademi terbaik di Lumajang!",
  keywords: ["Dashboard", "Data Visualization", "Software"],
  authors: [
    {
      name: "fazemii01",
      url: "",
    },
  ],
  creator: "fazemii01",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://wirabhakti.my.id",
    title: "Wirabhakti Basketball Academy",
    description: "Basket akademi terbaik di Lumajang!",
    siteName: "Wirabhakti Basketball Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wirabhakti Basketball Academy",
    description: "Basket akademi terbaik di Lumajang!",
    creator: "@fazemii01",
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white-50 h-full antialiased dark:bg-gray-950`}
      >
        <ThemeProvider
          defaultTheme="system"
          disableTransitionOnChange
          attribute="class"
        >
          {children}
          <Toaster richColors position="top-center" closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
