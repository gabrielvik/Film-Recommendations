import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  X 
} from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/5",
        success:
          "border-success/50 text-success dark:border-success [&>svg]:text-success bg-success/5",
        warning:
          "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning bg-warning/5",
        info:
          "border-info/50 text-info dark:border-info [&>svg]:text-info bg-info/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, dismissible = false, onDismiss, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = () => {
      setIsVisible(false)
      onDismiss?.()
    }

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {children}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Convenience components with icons
export interface IconAlertProps extends Omit<AlertProps, "variant"> {
  title?: string
  description?: React.ReactNode
}

const ErrorAlert = React.forwardRef<HTMLDivElement, IconAlertProps>(
  ({ title, description, children, ...props }, ref) => (
    <Alert ref={ref} variant="destructive" {...props}>
      <AlertCircle className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
      {children}
    </Alert>
  )
)
ErrorAlert.displayName = "ErrorAlert"

const SuccessAlert = React.forwardRef<HTMLDivElement, IconAlertProps>(
  ({ title, description, children, ...props }, ref) => (
    <Alert ref={ref} variant="success" {...props}>
      <CheckCircle2 className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
      {children}
    </Alert>
  )
)
SuccessAlert.displayName = "SuccessAlert"

const WarningAlert = React.forwardRef<HTMLDivElement, IconAlertProps>(
  ({ title, description, children, ...props }, ref) => (
    <Alert ref={ref} variant="warning" {...props}>
      <AlertTriangle className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
      {children}
    </Alert>
  )
)
WarningAlert.displayName = "WarningAlert"

const InfoAlert = React.forwardRef<HTMLDivElement, IconAlertProps>(
  ({ title, description, children, ...props }, ref) => (
    <Alert ref={ref} variant="info" {...props}>
      <Info className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
      {children}
    </Alert>
  )
)
InfoAlert.displayName = "InfoAlert"

export { 
  Alert, 
  AlertTitle, 
  AlertDescription,
  ErrorAlert,
  SuccessAlert,
  WarningAlert,
  InfoAlert,
  alertVariants
}
