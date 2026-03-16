"use client"

import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface AuthGuardProps {
  children: React.ReactNode
  redirectPath?: string
}

export default function AuthGuard({ children, redirectPath }: AuthGuardProps) {
  const { isAuthenticated, isChecking } = useAuth({ requireAuth: true, redirectPath })

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
