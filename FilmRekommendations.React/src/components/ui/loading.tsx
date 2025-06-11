import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      color: {
        default: "text-primary",
        muted: "text-muted-foreground",
        white: "text-white",
        current: "text-current",
      },
    },
    defaultVariants: {
      size: "default",
      color: "default",
    },
  }
)

export interface SpinnerProps
  extends Omit<React.SVGProps<SVGSVGElement>, "color">,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, color, ...props }, ref) => {
    return (
      <Loader2
        ref={ref}
        className={cn(spinnerVariants({ size, color }), className)}
        {...props}
      />
    )
  }
)
Spinner.displayName = "Spinner"

// Loading component with text
export interface LoadingProps extends VariantProps<typeof spinnerVariants> {
  text?: string
  className?: string
  center?: boolean
  overlay?: boolean
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ 
    text = "Loading...", 
    size, 
    color, 
    className, 
    center = false,
    overlay = false,
    ...props 
  }, ref) => {
    const content = (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2",
          center && "justify-center",
          overlay && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
          overlay && center && "flex items-center justify-center",
          className
        )}
        {...props}
      >
        <Spinner size={size} color={color} />
        {text && (
          <span className="text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    )

    return content
  }
)
Loading.displayName = "Loading"

// Skeleton component for loading states
const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "",
        text: "h-4",
        heading: "h-6",
        avatar: "rounded-full",
        button: "h-9",
        card: "h-32",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// Dots loading animation
export interface DotsProps {
  className?: string
  size?: "sm" | "default" | "lg"
}

const Dots: React.FC<DotsProps> = ({ className, size = "default" }) => {
  const dotSize = {
    sm: "w-1 h-1",
    default: "w-2 h-2", 
    lg: "w-3 h-3"
  }[size]

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-current rounded-full animate-pulse",
            dotSize
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  )
}

// Pulse loading animation
export interface PulseProps {
  className?: string
  children: React.ReactNode
}

const Pulse: React.FC<PulseProps> = ({ className, children }) => {
  return (
    <div className={cn("animate-pulse", className)}>
      {children}
    </div>
  )
}

export { 
  Spinner, 
  Loading, 
  Skeleton, 
  Dots, 
  Pulse,
  spinnerVariants,
  skeletonVariants 
}
