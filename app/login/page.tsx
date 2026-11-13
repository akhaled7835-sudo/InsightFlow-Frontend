import { LoginShowcase } from "@/components/login-showcase"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background p-3 sm:p-4 lg:p-5">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-4 lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-2">
        <LoginShowcase />
        <div className="flex items-center justify-center px-2 py-10 sm:px-6">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
