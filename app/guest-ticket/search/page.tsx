"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Lock } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function GuestTicketSearchPage() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSearch = () => {
    if (!name || !phoneNumber || !password) {
      toast({
        title: "입력 오류",
        description: "모든 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 비회원 승차권 확인 페이지로 이동
    window.location.href = "/guest-ticket/tickets";
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              비회원 승차권 확인
            </h2>
            <p className="text-muted-foreground">
              비회원 인증 후 승차권(웹티켓)을 확인하실 수 있습니다.{" "}
              <span className="text-red-600 dark:text-red-400 font-medium">
                (전화발권 승차권 : 비밀번호 5자리는 코레일 일일톡이나
                문자메시지를 확인하세요.)
              </span>
            </p>
          </div>

          {/* Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="space-y-6"
              >
                {/* 이름 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    이름
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="이름을 입력하세요."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* 휴대폰 번호 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-foreground"
                  >
                    휴대폰 번호
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="'*'를 제외, 휴대폰번호를 입력하세요."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    비밀번호
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="비밀번호 5자리를 입력하세요."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      maxLength={5}
                      className="pl-10"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 text-center">
                  <Button
                    type="submit"
                    className="px-8 py-3 rounded-full text-lg font-medium"
                  >
                    비회원 승차권 확인
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle asChild className="text-lg font-bold text-foreground">
                <h3>RAILLO 회원에게만 제공되는 특별한 혜택</h3>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-foreground">
                <li>
                  • 최대 40% 할인승차권 구매(청소년, 청춘, 기차생활수급자,
                  나그네, 4인동반, 단체, KTX5000 특가)
                </li>
                <li>• 입석부를 위한 무료 특실 업그레이드 서비스</li>
                <li>• 동일 구간 할인율 위한 N카드 구매 가능</li>
                <li>• 현금처럼 사용할 수 있는 마일리지 적립서비스</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
