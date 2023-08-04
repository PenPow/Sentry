import * as React from "react"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo />
          <p className="text-center text-sm leading-loose md:text-left">
            &copy; 2023 Joshua Clements. All rights reserved. View our <a href="/legal/privacy" className="underline hover:text-foreground/80">Privacy Policy</a> and <a href="/legal/tos" className="underline hover:text-foreground/80">Terms of Service</a>
          </p>
        </div>
        <ModeToggle />
      </div>
    </footer>
  )
}