import { ThemeProvider } from "@/components/ui"
import ComponentDemo from "@/components/demo/ComponentDemo"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="cinematiq-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <ComponentDemo />
      </div>
    </ThemeProvider>
  )
}

export default App
