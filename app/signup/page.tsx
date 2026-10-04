"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";
import { signup } from "@/lib/api/authentication";
import type { SignupRequest } from "@/types/authType";
import {
  signupSchema,
  SignupFormValues,
  formatPhoneNumber,
  removePhoneNumberFormatting,
} from "@/lib/validation/signup";
import { handleError } from "@/lib/utils/errorHandler";
import { useToast } from "@/hooks/useToast";
import { LOCAL_STORAGE_KEYS } from "@/constants/storageKeys";
import { PasswordFields } from "./_components/PasswordFields";
import { BirthDateField } from "./_components/BirthDateField";
import { GenderField } from "./_components/GenderField";
import { TermsAgreement } from "./_components/TermsAgreement";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      birthDate: "",
      gender: undefined,
      terms: undefined,
      privacy: undefined,
      marketing: false,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const signupData: SignupRequest = {
        name: data.name,
        phoneNumber: removePhoneNumberFormatting(data.phoneNumber),
        password: data.password,
        email: data.email,
        birthDate: data.birthDate,
        gender: data.gender,
      };

      const response = await signup(signupData);

      const memberNo = response?.memberNo || "회원번호 없음";
      localStorage.setItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER, memberNo);

      router.push("/signup/complete");
    } catch (error: unknown) {
      // handleError는 문구만 돌려준다 — 안내는 여기서 띄운다
      toast({
        title: "오류",
        description: handleError(error, "회원가입에 실패했습니다."),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elev-md">
            <CardHeader className="text-center">
              <CardTitle asChild className="text-2xl font-bold text-foreground">
                <h1>회원가입</h1>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                RAILLO 회원이 되어 더 많은 혜택을 누리세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-6"
              >
                {/* 성명 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    성명 <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="성명을 입력하세요"
                      {...register("name")}
                      className={`pl-10 ${errors.name ? "border-red-500 dark:border-red-400" : ""}`}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* 이메일 주소 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    이메일 주소 <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="이메일 주소를 입력하세요"
                      {...register("email")}
                      className={`pl-10 ${errors.email ? "border-red-500 dark:border-red-400" : ""}`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <PasswordFields register={register} control={control} errors={errors} />

                {/* 휴대폰 번호 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="text-sm font-medium text-foreground"
                  >
                    휴대폰 번호 <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="휴대폰 번호를 입력하세요 (예: 010-1234-5678)"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(formatPhoneNumber(e.target.value))
                          }
                          className={`pl-10 ${errors.phoneNumber ? "border-red-500 dark:border-red-400" : ""}`}
                          autoComplete="tel"
                        />
                      )}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* 생년월일 */}
                <BirthDateField
                  error={errors.birthDate?.message}
                  // 연·월을 바꿔 비울 때는 검증하지 않고, 일까지 골라 날짜가 만들어지면 검증한다
                  onChange={(birthDate) =>
                    setValue("birthDate", birthDate, { shouldValidate: birthDate !== "" })
                  }
                />

                {/* 성별 */}
                <GenderField control={control} error={errors.gender?.message} />

                <TermsAgreement control={control} errors={errors} />

                {/* 회원가입 버튼 */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-semibold py-3 mt-8"
                  size="lg"
                >
                  {isSubmitting ? "회원가입 중..." : "회원가입 완료"}
                </Button>

                {/* 추가 링크 */}
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    이미 RAILLO 회원이신가요?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:text-primary-active font-semibold"
                    >
                      로그인하기
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
