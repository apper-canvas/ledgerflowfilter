import React from "react"
import { cn } from "@/utils/cn"

const NotificationBadge = ({ count = 0, className, size = "small", ...props }) => {
  if (count === 0) return null
  
  const displayCount = count > 99 ? "99+" : count.toString()
  
  const sizeClasses = {
    small: "min-w-[18px] h-[18px] text-xs",
    medium: "min-w-[20px] h-[20px] text-sm",
    large: "min-w-[24px] h-[24px] text-sm"
  }
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-1.5 font-medium text-white bg-error rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {displayCount}
    </span>
  )
}

export default NotificationBadge