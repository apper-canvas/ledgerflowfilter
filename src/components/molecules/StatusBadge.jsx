import React from "react"
import { cn } from "@/utils/cn"

const StatusBadge = ({ status, className }) => {
  const variants = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    synced: "bg-blue-100 text-blue-800",
    offline: "bg-orange-100 text-orange-800"
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variants[status] || variants.draft,
      className
    )}>
      {status}
    </span>
  )
}

export default StatusBadge