import React from "react"
import Label from "@/components/atoms/Label"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { cn } from "@/utils/cn"

const FormField = ({ label, type = "text", error, children, className, required, disabled, ...props }) => {
  const id = props.id || props.name

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </Label>
      )}
{children || (
        type === "select" ? (
          <Select id={id} disabled={disabled} {...props}>
            {props.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ) : (
          <Input id={id} type={type} disabled={disabled} {...props} />
        )
      )}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}

export default FormField