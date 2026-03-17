import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeaderAuthBtn from "./HeaderAuthBtn";
import MyPageBtn from "./MyPageBtn";
import SidebarTrigger from "./SidebarTrigger";

const HeaderActions = () => {
  return (
    <div className="flex items-center space-x-4 ml-auto">
      <nav className="hidden md:flex items-center space-x-4">
        <HeaderAuthBtn />
        <Link href="/ticket/reservations">
          <Button variant="ghost" size="sm">
            예약 승차권 조회
          </Button>
        </Link>
        <Link href="/ticket/purchased">
          <Button variant="ghost" size="sm">
            승차권 조회
          </Button>
        </Link>
        <MyPageBtn />
        <SidebarTrigger />
      </nav>
    </div>
  );
};

export default HeaderActions;
