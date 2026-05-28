import * as React from "react"
import { Label } from "./label"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { Switch } from "./switch"
import { cn } from "@/lib/utils"

interface FieldProps { label?: string; error?: string; className?: string }

export function FormInput({ label, error, className, ...props }: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label>{label}</Label>}
      <Input {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function FormTextarea({ label, error, className, ...props }: FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label>{label}</Label>}
      <Textarea {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

interface SwitchFieldProps extends React.ComponentPropsWithoutRef<typeof Switch> { label?: string }
export function SwitchField({ label, ...props }: SwitchFieldProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Switch {...props} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}
