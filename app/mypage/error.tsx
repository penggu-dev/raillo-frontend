"use client";

import { RouteError, type RouteErrorProps } from "@/components/common/RouteError";

export default function Error(props: RouteErrorProps) {
  return <RouteError {...props} back={{ href: "/mypage", label: "마이페이지로" }} />;
}
