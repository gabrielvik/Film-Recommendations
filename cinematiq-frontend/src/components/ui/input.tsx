import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
      },
      inputSize: {
        default: "h-9",
        sm: "h-8 px-2 text-xs",
        lg: "h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: string
  helperText?: string
  label?: string
  showPasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize, 
    type = "text",
    error,
    helperText,
    label,
    showPasswordToggle = false,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [localId] = React.useState(() => id || `input-${Math.random().toString(36).substr(2, 9)}`)
    
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type
    const hasError = Boolean(error)
    const finalVariant = hasError ? "error" : variant

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={localId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: finalVariant, inputSize }),
              isPassword && showPasswordToggle && "pr-10",
              className
            )}
            ref={ref}
            id={localId}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${localId}-error` : helperText ? `${localId}-description` : undefined
            }
            {...props}
          />
          
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <div 
            id={`${localId}-error`}
            className="flex items-center gap-2 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {helperText && !error && (
          <div 
            id={`${localId}-description`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
