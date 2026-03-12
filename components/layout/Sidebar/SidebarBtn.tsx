import Link from "next/link";
import { CreditCard, Ticket, Search, LucideIcon } from "lucide-react";
import { DrawerClose } from "@/components/ui/drawer";

type SidebarBtnType =
  | "ticket-purchased"
  | "ticket-booking"
  | "ticket-reservations";

interface SidebarBtnConfig {
  href: string;
  icon: LucideIcon;
  iconColor: string;
  label: string;
}

const SIDEBAR_BTN_CONFIG: Record<SidebarBtnType, SidebarBtnConfig> = {
  "ticket-purchased": {
    href: "/ticket/purchased",
    icon: CreditCard,
    iconColor: "text-green-600",
    label: "승차권 확인",
  },
  "ticket-booking": {
    href: "/ticket/booking",
    icon: Ticket,
    iconColor: "text-blue-600",
    label: "승차권 예매",
  },
  "ticket-reservations": {
    href: "/ticket/reservations",
    icon: Search,
    iconColor: "text-orange-600",
    label: "예약 승차권 조회",
  },
};

interface SidebarBtnProps {
  type: SidebarBtnType;
}

const SidebarBtn = ({ type }: SidebarBtnProps) => {
  const config = SIDEBAR_BTN_CONFIG[type];
  const Icon = config.icon;

  return (
    <DrawerClose asChild>
      <Link
        href={config.href}
        className="flex items-center gap-3 rounded-lg hover:bg-muted transition-colors bg-white px-4 py-2"
      >
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
        <span className="text-gray-700">{config.label}</span>
      </Link>
    </DrawerClose>
  );
};

export default SidebarBtn;
