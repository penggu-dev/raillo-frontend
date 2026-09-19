import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";

const MyPageBtn = () => {
  return (
    <Button variant="ghost" size="sm" className="flex items-center space-x-2" asChild>
      <Link href="/mypage">
        <User className="h-4 w-4" />
        <span>마이페이지</span>
      </Link>
    </Button>
  );
};

export default MyPageBtn;
