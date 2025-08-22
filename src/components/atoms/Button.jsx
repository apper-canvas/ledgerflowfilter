import React from "react"
import { cn } from "@/utils/cn"

const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-primary-700 text-white hover:bg-primary-800",
    secondary: "bg-secondary-500 text-white hover:bg-secondary-600",
outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    link: "text-primary-700 underline-offset-4 hover:underline",
    success: "bg-success text-white hover:bg-green-600",
    warning: "bg-warning text-gray-900 hover:bg-yellow-400",
    danger: "bg-error text-white hover:bg-red-600",
    export: "bg-blue-600 text-white hover:bg-blue-700",
    analytics: "bg-purple-600 text-white hover:bg-purple-700",
    admin: "bg-red-700 text-white hover:bg-red-800",
    user: "bg-indigo-600 text-white hover:bg-indigo-700"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button