"use client";

import { RouteError, type RouteErrorProps } from "@/components/common/RouteError";

export default function Error(props: RouteErrorProps) {
  return <RouteError {...props} back={{ href: "/ticket/purchased", label: "예매 내역으로" }} />;
}
