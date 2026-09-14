import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-sm skeleton-shimmer", className)}
      {...props}
    />
  )
}

export { Skeleton }
