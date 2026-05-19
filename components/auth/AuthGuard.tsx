"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export default function AuthGuard({ children, redirectPath }: AuthGuardProps) {
  const { isAuthenticated, isChecking } = useAuth({
    requireAuth: true,
    redirectPath,
  });

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="md" className="mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
