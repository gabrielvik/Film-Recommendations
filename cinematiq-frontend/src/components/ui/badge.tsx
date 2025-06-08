import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        success:
          "border-transparent bg-success text-success-foreground shadow hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80",
        info:
          "border-transparent bg-info text-info-foreground shadow hover:bg-info/80",
        outline: 
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        ghost:
          "border-transparent hover:bg-accent hover:text-accent-foreground",
        gradient:
          "border-transparent gradient-primary text-white shadow-glow",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-full",
        square: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape,
    icon,
    removable = false,
    onRemove,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, shape }), className)}
        {...props}
      >
        {icon && <span className="mr-1 h-3 w-3">{icon}</span>}
        {children}
        {removable && (
          <button
            onClick={onRemove}
            className="ml-1 h-3 w-3 rounded-full hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/50"
            aria-label="Remove badge"
          >
            ×
          </button>
        )}
      </div>
    )
  }
)
Badge.displayName = "Badge"

// Genre-specific badge for movies
export interface GenreBadgeProps extends Omit<BadgeProps, "variant"> {
  genre: string
}

const GenreBadge = React.forwardRef<HTMLDivElement, GenreBadgeProps>(
  ({ genre, className, ...props }, ref) => {
    // Define colors for different genres
    const genreColors: Record<string, "default" | "secondary" | "success" | "warning" | "info"> = {
      action: "destructive" as any,
      adventure: "warning",
      comedy: "success",
      drama: "secondary",
      horror: "destructive" as any,
      romance: "info",
      "sci-fi": "info",
      thriller: "destructive" as any,
      fantasy: "success",
      mystery: "secondary",
      crime: "destructive" as any,
      documentary: "outline" as any,
      animation: "success",
      family: "success",
      music: "info",
      war: "secondary",
      western: "warning",
      biography: "outline" as any,
      history: "secondary",
      sport: "success",
    }

    const variant = genreColors[genre.toLowerCase()] || "default"

    return (
      <Badge
        ref={ref}
        variant={variant}
        size="sm"
        shape="pill"
        className={cn("capitalize", className)}
        {...props}
      >
        {genre}
      </Badge>
    )
  }
)
GenreBadge.displayName = "GenreBadge"

// Rating badge for movies
export interface RatingBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
  rating: number
  maxRating?: number
  showIcon?: boolean
}

const RatingBadge = React.forwardRef<HTMLDivElement, RatingBadgeProps>(
  ({ rating, maxRating = 10, showIcon = true, className, ...props }, ref) => {
    const getVariant = (rating: number, maxRating: number) => {
      const percentage = (rating / maxRating) * 100
      if (percentage >= 80) return "success"
      if (percentage >= 60) return "warning"
      if (percentage >= 40) return "secondary"
      return "destructive" as any
    }

    return (
      <Badge
        ref={ref}
        variant={getVariant(rating, maxRating)}
        size="sm"
        className={cn("font-mono", className)}
        icon={showIcon ? "⭐" : undefined}
        {...props}
      >
        {rating.toFixed(1)}
      </Badge>
    )
  }
)
RatingBadge.displayName = "RatingBadge"

// Status badge
export interface StatusBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
  status: "online" | "offline" | "pending" | "success" | "error" | "warning"
  showDot?: boolean
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, showDot = true, className, ...props }, ref) => {
    const statusConfig = {
      online: { variant: "success" as const, label: "Online", color: "bg-green-500" },
      offline: { variant: "secondary" as const, label: "Offline", color: "bg-gray-500" },
      pending: { variant: "warning" as const, label: "Pending", color: "bg-yellow-500" },
      success: { variant: "success" as const, label: "Success", color: "bg-green-500" },
      error: { variant: "destructive" as const, label: "Error", color: "bg-red-500" },
      warning: { variant: "warning" as const, label: "Warning", color: "bg-yellow-500" },
    }

    const config = statusConfig[status]

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        size="sm"
        shape="pill"
        className={cn("capitalize", className)}
        {...props}
      >
        {showDot && (
          <span className={cn("mr-1 h-2 w-2 rounded-full", config.color)} />
        )}
        {config.label}
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { 
  Badge, 
  GenreBadge, 
  RatingBadge, 
  StatusBadge,
  badgeVariants 
}
