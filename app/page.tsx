import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Receipt,
  Ticket,
  Train,
  MapPin,
  Clock,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { HomeSearchForm } from "./_components/HomeSearchForm";

interface Shortcut {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const SHORTCUTS: Shortcut[] = [
  {
    href: "/guest-ticket/search",
    title: "비회원 승차권 확인",
    description: "회원가입 없이 예매한 승차권을 확인하세요",
    icon: Ticket,
  },
  {
    href: "/ticket/history",
    title: "구입 이력·영수증",
    description: "지난 결제와 영수증을 확인하세요",
    icon: Receipt,
  },
  {
    href: "/signup",
    title: "회원가입",
    description: "예매 내역을 한곳에서 관리하세요",
    icon: UserPlus,
  },
];

// 서버 컴포넌트 — 소개·바로가기·안내는 정적이라 JS로 내려보내지 않고, 예매 폼만 클라이언트 컴포넌트(HomeSearchForm)
export default function HomePage() {
  return (
    <>
      {/* Main Content */}
      <div className="bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section with reduced spacing */}
          <div className="text-center mb-12">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-elev-md">
                <Train className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              안전하고 편리한
              <span className="block text-primary">철도여행</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed break-keep">
              RAILLO와 함께하는 스마트한 기차여행을 시작하세요
            </p>
          </div>

          {/* Ticket Booking Form with enhanced design */}
          <Card className="mb-16 shadow-elev-lg">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-2">열차 예매</h2>
                <p className="text-muted-foreground break-keep">
                  원하는 조건으로 열차를 검색하고 예매하세요
                </p>
              </div>

              <HomeSearchForm />
            </CardContent>
          </Card>

          {/* 바로가기 — 헤더 메뉴와 겹치지 않는 화면만 */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-foreground text-center mb-8">
              바로가기
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SHORTCUTS.map(({ href, title, description, icon: Icon }) => (
                <Link key={href} href={href} className="group rounded-card">
                  <Card className="h-full transition-all duration-200 group-hover:shadow-elev-md group-hover:-translate-y-0.5">
                    <CardHeader className="flex-row items-center gap-4 space-y-0">
                      {/* 아이콘은 장식 — 파랑·도메인 색을 쓰지 않고 중립 타일로(빈 목록 아이콘 타일과 같은 규칙) */}
                      <div className="shrink-0 rounded-xl border bg-muted p-3 text-foreground">
                        <Icon className="h-6 w-6" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle asChild className="text-lg text-foreground">
                          <h3>{title}</h3>
                        </CardTitle>
                        <CardDescription className="mt-1 break-keep">{description}</CardDescription>
                      </div>
                      <ArrowRight
                        className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Additional Features Section */}
          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm whitespace-nowrap">24시간 운영</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span className="text-sm whitespace-nowrap">전국 역 연결</span>
              </div>
              <div className="flex items-center space-x-2">
                <Train className="h-5 w-5" />
                <span className="text-sm whitespace-nowrap">안전한 여행</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
