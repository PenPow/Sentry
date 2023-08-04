import { cn } from "@/lib/utils"
import { Icons } from "./icons"

interface CalloutProps {
  icon?: JSX.Element
  children?: React.ReactNode
  type?: "note" | "warning" | "danger" | "info" | "tip"
}

export function Callout({
  children,
  icon,
  type = "note",
  ...props
}: CalloutProps) {

  const calloutIcon = icon ?? (
	(type === "warning" && <Icons.warning/>) || 
	(type === "danger" && <Icons.danger/>) || 
	(type === "tip" && <Icons.tip />) || 
	(type === "info" && <Icons.info />) 
	|| <Icons.note />)

  return (
    <div
      className={cn("my-6 flex items-start rounded-md border border-l-4 bg-muted/10 p-4", {
        "border-destructive": type === "danger",
        "border-warning": type === "warning",
		"border-green-400": type === "tip",
		"border-blue-500": type === "info",
      })}
      {...props}
    >
      {calloutIcon && <span className="mr-4 text-2xl">{calloutIcon}</span>}
      <div>{children}</div>
    </div>
  )
}