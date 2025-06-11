import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  ThemeToggle,
} from "@/components/ui"
import { Heart, Play } from "lucide-react"

function ComponentDemo() {
  return (
    <div className="container-section space-y-section py-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-heading-1 text-gradient mb-4">
          CinematIQ Design System
        </h1>
        <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
          A comprehensive component library for the CinematIQ movie discovery platform.
          Built with React, TypeScript, and Tailwind CSS.
        </p>
        <div className="mt-6 flex justify-center">
          <ThemeToggle variant="select" />
        </div>
      </div>

      {/* Buttons Section */}
      <section className="space-y-component">
        <h2 className="text-heading-3">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="gradient">Gradient</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button size="icon"><Heart className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-component">
        <h2 className="text-heading-3">Cards</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Basic Card</CardTitle>
              <CardDescription>
                A simple card component with header and content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the card content area where you can place any content.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>
                Enhanced shadow for more prominent display.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Watch Trailer
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-component">
        <h2 className="text-heading-3">Badges</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="gradient">Gradient</Badge>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ComponentDemo
