"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Train,
  ChevronDown,
  User,
  CreditCard,
  Ticket,
  ShoppingCart,
  Settings,
  Star,
} from "lucide-react";
import { sendEmailVerificationCode } from "@/lib/api/authMembers";
import { updatePhoneNumber } from "@/lib/api/members";
import { useToast } from "@/hooks/useToast";
import AuthGuard from "@/components/auth/AuthGuard";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "이메일 주소를 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
});

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^01[0-9]{9}$/, "올바른 휴대폰 번호 형식을 입력해주세요."),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;

function ContactChangePageContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    ticketInfo: false,
    membershipPerformance: false,
    paymentManagement: false,
  });

  const [phoneNumber1, setPhoneNumber1] = useState("");
  const [phoneNumber2, setPhoneNumber2] = useState("");
  const [phoneNumber3, setPhoneNumber3] = useState("");

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const updatePhoneField = (p1: string, p2: string, p3: string) => {
    phoneForm.setValue("phoneNumber", `${p1}${p2}${p3}`, {
      shouldValidate: true,
    });
  };

  const onEmailVerification = async (data: EmailFormValues) => {
    try {
      await sendEmailVerificationCode(data.email);
      toast({ title: "성공", description: "이메일 인증코드가 발송되었습니다." });
      router.push("/mypage/email/change");
    } catch {
      toast({
        title: "오류",
        description: "이메일 인증코드 발송에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const onPhoneVerification = async (data: PhoneFormValues) => {
    try {
      await updatePhoneNumber(data.phoneNumber);
      toast({ title: "성공", description: "휴대폰 번호 변경이 성공적으로 처리되었습니다." });
      router.push("/mypage");
    } catch {
      toast({
        title: "오류",
        description: "휴대폰 번호 변경에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-80">
            {/* Profile Header */}
            <Card className="mb-6 bg-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Train className="h-16 w-16 mx-auto mb-2 text-white" />
                  <h2 className="text-xl font-bold">RAILLO</h2>
                  <p className="text-blue-100">마이페이지</p>
                </div>
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    비즈니스
                  </Badge>
                </div>
                <h3 className="font-bold text-lg">김구름 회원님</h3>
                <p className="text-sm text-gray-600">마일리지: 0P</p>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <Link
                    href="/mypage"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                    <span>마이 RAILLO</span>
                  </Link>

                  <Collapsible
                    open={openSections.ticketInfo}
                    onOpenChange={() => toggleSection("ticketInfo")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Ticket className="h-5 w-5 text-gray-600" />
                        <span>승차권 정보</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.ticketInfo ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50">
                      <Link
                        href="/ticket/purchased"
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <span>승차권 확인</span>
                      </Link>
                      <Link
                        href="/ticket/reservations"
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <span>예약승차권 조회/취소</span>
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSections.membershipPerformance}
                    onOpenChange={() => toggleSection("membershipPerformance")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-gray-600" />
                        <span>기차여행정보</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.membershipPerformance ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                  </Collapsible>

                  <Collapsible
                    open={openSections.paymentManagement}
                    onOpenChange={() => toggleSection("paymentManagement")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <span>멤버십 실적 조회</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.paymentManagement ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                  </Collapsible>

                  <div className="px-4 py-3 text-blue-600 bg-blue-50 border-r-2 border-blue-600">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">회원정보관리</span>
                    </div>
                  </div>

                  <Link
                    href="/cart"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <span>장바구니</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-8">
                {/* 서비스 안내 */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    이메일/휴대폰 인증 이용 가능한 서비스
                  </h2>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      • 휴대폰으로 로그인하기 위해 사용되는 휴대폰번호 인증처리
                    </p>
                    <p>• 이메일로 로그인하기 위해 사용되는 이메일 인증처리</p>
                    <p>
                      • 이메일 또는 휴대폰으로 로그인하기 위해서는 반드시
                      인증절차를 거쳐야 합니다.
                    </p>
                    <p className="text-red-500 font-medium">
                      • 이메일/휴대폰 인증/변경은 1일 1회만 가능합니다.
                    </p>
                  </div>
                </div>

                {/* 이메일 인증/변경 */}
                <div className="mb-12">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    이메일 인증/변경
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700 mb-6">
                    <p>• 로그인에 사용할 이메일 계정을 인증합니다.</p>
                    <p>
                      • 인증 받은 이메일 주소로 회원정보의 이메일주소가 자동
                      변경 됩니다.
                    </p>
                    <p>
                      • 인증요청을 클릭하면 나타나는 팝업창에{" "}
                      <span className="text-red-500 font-medium">
                        입력하신 이메일 계정으로 발송된 인증코드를 입력
                      </span>
                      하여 주십시오.
                    </p>
                  </div>

                  <form
                    onSubmit={emailForm.handleSubmit(onEmailVerification)}
                    className="flex items-start space-x-4"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 주소
                      </label>
                      <Input
                        type="email"
                        placeholder="이메일 주소를 입력하세요"
                        {...emailForm.register("email")}
                        className={`w-full ${emailForm.formState.errors.email ? "border-red-500" : ""}`}
                        autoComplete="email"
                      />
                      {emailForm.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {emailForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={emailForm.formState.isSubmitting}
                      variant="outline"
                      className="mt-7 px-6 py-2 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                      {emailForm.formState.isSubmitting ? "처리 중..." : "이메일 인증"}
                    </Button>
                  </form>
                </div>

                {/* 휴대폰 인증/변경 */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    휴대폰 인증/변경
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700 mb-6">
                    <p>• 로그인에 사용할 휴대폰 번호를 인증합니다.</p>
                    <p>
                      • 인증 받은 이메일 주소로 회원정보의 이메일주소가 자동
                      변경 됩니다.
                    </p>
                    <p>
                      • 멤버십 비밀번호와 휴대폰번호를 동일하게 설정할 수
                      없습니다.
                    </p>
                  </div>

                  <form
                    onSubmit={phoneForm.handleSubmit(onPhoneVerification)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        휴대폰번호
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={phoneNumber1}
                          onChange={(e) => {
                            setPhoneNumber1(e.target.value);
                            updatePhoneField(e.target.value, phoneNumber2, phoneNumber3);
                          }}
                          placeholder="010"
                          className="w-20 text-center"
                          maxLength={3}
                          autoComplete="tel-area-code"
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="text"
                          value={phoneNumber2}
                          onChange={(e) => {
                            setPhoneNumber2(e.target.value);
                            updatePhoneField(phoneNumber1, e.target.value, phoneNumber3);
                          }}
                          placeholder="0000"
                          className="w-24 text-center"
                          maxLength={4}
                          autoComplete="tel-local-prefix"
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="text"
                          value={phoneNumber3}
                          onChange={(e) => {
                            setPhoneNumber3(e.target.value);
                            updatePhoneField(phoneNumber1, phoneNumber2, e.target.value);
                          }}
                          placeholder="0000"
                          className="w-24 text-center"
                          maxLength={4}
                          autoComplete="tel-local-suffix"
                        />
                      </div>
                      {phoneForm.formState.errors.phoneNumber && (
                        <p className="text-xs text-red-500 mt-1">
                          {phoneForm.formState.errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={phoneForm.formState.isSubmitting}
                      variant="outline"
                      className="px-6 py-2 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                      {phoneForm.formState.isSubmitting ? "처리 중..." : "휴대폰 인증/변경"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactChangePage() {
  return (
    <AuthGuard>
      <ContactChangePageContent />
    </AuthGuard>
  );
}
