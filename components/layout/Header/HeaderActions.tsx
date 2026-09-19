import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeaderAuthBtn from "./HeaderAuthBtn";
import MyPageBtn from "./MyPageBtn";
import SidebarTrigger from "./SidebarTrigger";
import ThemeToggle from "./ThemeToggle";

const HeaderActions = () => {
  return (
    <div className="flex items-center space-x-4 ml-auto">
      <nav className="hidden md:flex items-center space-x-4">
        <HeaderAuthBtn />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ticket/reservations">
            예약 승차권 조회
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ticket/purchased">
            승차권 조회
          </Link>
        </Button>
        <MyPageBtn />
        <SidebarTrigger />
      </nav>
      <ThemeToggle />
    </div>
  );
};

export default HeaderActions;
