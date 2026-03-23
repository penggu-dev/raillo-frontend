"use client";

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PATH_MAP: { [key: string]: string } = {
  ticket: "승차권",
  booking: "예매",
  search: "검색",
  payment: "결제",
  "payment-complete": "결제완료",
  purchased: "구매완료",
  reservation: "예약",
  reservations: "예약승차권 조회",
  general: "일반",
  "guest-ticket": "비회원",
  tickets: "승차권 목록",
  cart: "장바구니",
  mypage: "마이페이지",
  withdraw: "회원탈퇴",
  login: "로그인",
  signup: "회원가입",
  complete: "완료",
  verify: "인증",
  "find-account": "계정찾기",
  "reset-password": "비밀번호 재설정",
  result: "결과",
  contact: "연락처",
  change: "변경",
  password: "비밀번호",
};

const Breadcrumb = () => {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);
    if (paths.length === 0) return [];

    const result: Array<{ name: string; path: string }> = [{ name: "홈", path: "/" }];
    let currentPath = "";
    for (const segment of paths) {
      currentPath += `/${segment}`;
      result.push({ name: PATH_MAP[segment] || segment, path: currentPath });
    }
    return result;
  }, [pathname]);
  return (
    <>
      {breadcrumbs.length > 1 && (
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.path} className="flex items-center space-x-2">
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              {index === 0 ? (
                // 홈만 클릭 가능
                <Link href={breadcrumb.path} className="hover:text-blue-600">
                  {breadcrumb.name}
                </Link>
              ) : index === breadcrumbs.length - 1 ? (
                // 마지막 경로는 현재 페이지 표시
                <span className="text-blue-600 font-medium">
                  {breadcrumb.name}
                </span>
              ) : (
                // 중간 경로들은 클릭 불가능
                <span className="text-gray-500">{breadcrumb.name}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Breadcrumb;
