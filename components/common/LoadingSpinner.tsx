import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "white";
  className?: string;
}

const sizeClass = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const colorClass = {
  blue: "text-blue-600",
  white: "text-white",
};

export default function LoadingSpinner({
  size = "lg",
  color = "blue",
  className,
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={`animate-spin ${sizeClass[size]} ${colorClass[color]} ${className ?? ""}`}
    />
  );
}
