import { Moon, Sun, Monitor } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ui/theme-provider"
import { cn } from "@/lib/utils"

export interface ThemeToggleProps {
  className?: string
  variant?: "icon" | "button" | "select"
  size?: "sm" | "default" | "lg"
}

export function ThemeToggle({ 
  className, 
  variant = "icon", 
  size = "default" 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className={cn("h-9 w-9", className)}
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    )
  }

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className={cn("gap-2", className)}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only sm:not-sr-only">
          {theme === "light" ? "Dark mode" : "Light mode"}
        </span>
      </Button>
    )
  }

  // Select variant with all three options
  return (
    <div className={cn("flex rounded-lg border bg-background p-1", className)}>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          theme === "light" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          theme === "dark" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          theme === "system" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="System mode"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}
