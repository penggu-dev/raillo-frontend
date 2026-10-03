"use client";

import { RouteError, type RouteErrorProps } from "@/components/common/RouteError";

export default function Error(props: RouteErrorProps) {
  return <RouteError {...props} back={{ href: "/", label: "홈으로" }} />;
}
