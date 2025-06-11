import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-medium hover:shadow-hard transition-shadow duration-300",
        interactive: "hover:shadow-medium transition-all duration-200 cursor-pointer hover:scale-[1.02]",
        glass: "glass-effect",
        gradient: "border-0 gradient-primary text-white shadow-glow",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div"
    
    if (asChild) {
      return <>{props.children}</>
    }

    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Movie-specific card component
export interface MovieCardProps extends CardProps {
  title: string
  year?: number
  rating?: number
  poster?: string
  onClick?: () => void
}

const MovieCard = React.forwardRef<HTMLDivElement, MovieCardProps>(
  ({ 
    title, 
    year, 
    rating, 
    poster, 
    onClick, 
    className,
    children,
    ...props 
  }, ref) => (
    <Card
      ref={ref}
      variant="interactive"
      padding="none"
      className={cn("movie-card overflow-hidden", className)}
      onClick={onClick}
      {...props}
    >
      {poster && (
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={poster}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <CardContent className="p-4">
        <CardTitle className="line-clamp-2 text-base">{title}</CardTitle>
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          {year && <span>{year}</span>}
          {rating && (
            <span className="flex items-center gap-1">
              ⭐ {rating.toFixed(1)}
            </span>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
)
MovieCard.displayName = "MovieCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  MovieCard,
  cardVariants
}
