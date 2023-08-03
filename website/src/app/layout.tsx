import { Inter, Lexend } from "next/font/google"

import "@/styles/globals.css"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

const fontSans = Inter({
	subsets: ['latin'],
	variable: "--font-sans",
});

const fontHeading = Lexend({
	subsets: ['latin'],
	variable: "--font-heading",
})

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Sentry",
	"Moderation",
	"Discord",
	"Discord Bot",
	"Discord Moderation Bot",
	"Open Source"
  ],
  authors: [
    {
      name: "Joshua Clements",
      url: "https://www.penpow.dev",
    },
  ],
  creator: "Joshua Clements",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
	{ color: "#5865F2" }
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
	image: `${siteConfig.url}/SentryShieldOnly.png`
  },
  icons: {
    icon: "/favicon.ico",
  },
//   manifest: `${siteConfig.url}/site.webmanifest`, // TODO: Manifest
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head/>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
		  fontHeading.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}