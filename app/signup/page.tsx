"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";
import { signup } from "@/lib/api/authentication";
import type { SignupRequest } from "@/types/authType";
import {
  signupSchema,
  SignupFormValues,
  formatPhoneNumber,
  removePhoneNumberFormatting,
} from "@/lib/validation/signup";
import { handleError } from "@/lib/utils/errorHandler";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
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

  // 생년월일 옵션들
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 100 },
    (_, i) => currentYear - i,
  ).reverse();
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const [birthYear, setBirthYear] = useState<string>(currentYear.toString());
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthDay, setBirthDay] = useState<string>("");

  const getDayOptions = () => {
    if (!birthYear || !birthMonth) return [];
    const daysInMonth = new Date(
      parseInt(birthYear),
      parseInt(birthMonth),
      0,
    ).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleBirthDateChange = (
    type: "year" | "month" | "day",
    value: string,
  ) => {
    if (type === "year") {
      setBirthYear(value);
      setBirthMonth("");
      setBirthDay("");
      setValue("birthDate", "", { shouldValidate: false });
    } else if (type === "month") {
      setBirthMonth(value);
      setBirthDay("");
      setValue("birthDate", "", { shouldValidate: false });
    } else {
      setBirthDay(value);
      if (birthYear && birthMonth && value) {
        const formattedDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${value.padStart(2, "0")}`;
        setValue("birthDate", formattedDate, { shouldValidate: true });
      }
    }
  };

  const watchPassword = watch("password");
  const watchConfirmPassword = watch("confirmPassword");
  const passwordsMatch =
    watchPassword && watchConfirmPassword && watchPassword === watchConfirmPassword;

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
      localStorage.setItem("signupMemberNo", memberNo);

      router.push("/signup/complete");
    } catch (error: unknown) {
      handleError(error, "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                회원가입
              </CardTitle>
              <CardDescription className="text-gray-600">
                RAILLO 회원이 되어 더 많은 혜택을 누리세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* 성명 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    성명 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="성명을 입력하세요"
                      {...register("name")}
                      className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* 이메일 주소 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    이메일 주소 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="이메일 주소를 입력하세요"
                      {...register("email")}
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* 비밀번호 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    비밀번호 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요"
                      {...register("password")}
                      className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    8자 이상, 영문, 숫자, 특수문자를 포함해주세요.
                  </p>
                </div>

                {/* 비밀번호 확인 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      {...register("confirmPassword")}
                      className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                  {watchConfirmPassword && !errors.confirmPassword && (
                    <p
                      className={`text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
                    >
                      {passwordsMatch
                        ? "비밀번호가 일치합니다."
                        : "비밀번호가 일치하지 않습니다."}
                    </p>
                  )}
                </div>

                {/* 휴대폰 번호 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    휴대폰 번호 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                          className={`pl-10 ${errors.phoneNumber ? "border-red-500" : ""}`}
                          autoComplete="tel"
                        />
                      )}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                {/* 생년월일 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    생년월일 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <select
                        value={birthYear}
                        onChange={(e) =>
                          handleBirthDateChange("year", e.target.value)
                        }
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.birthDate ? "border-red-500" : ""}`}
                      >
                        <option value="">년도</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year.toString()}>
                            {year}년
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <select
                        value={birthMonth}
                        onChange={(e) =>
                          handleBirthDateChange("month", e.target.value)
                        }
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.birthDate ? "border-red-500" : ""}`}
                      >
                        <option value="">월</option>
                        {monthOptions.map((month) => (
                          <option key={month} value={month.toString()}>
                            {month}월
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <select
                        value={birthDay}
                        onChange={(e) =>
                          handleBirthDateChange("day", e.target.value)
                        }
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.birthDate ? "border-red-500" : ""}`}
                      >
                        <option value="">일</option>
                        {getDayOptions().map((day) => (
                          <option key={day} value={day.toString()}>
                            {day}일
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {errors.birthDate && (
                    <p className="text-xs text-red-500">{errors.birthDate.message}</p>
                  )}
                </div>

                {/* 성별 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    성별 <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant={field.value === "M" ? "default" : "outline"}
                          onClick={() => field.onChange("M")}
                          className={`flex-1 ${field.value === "M" ? "bg-blue-600 text-white" : "border-gray-300"}`}
                        >
                          남성
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "F" ? "default" : "outline"}
                          onClick={() => field.onChange("F")}
                          className={`flex-1 ${field.value === "F" ? "bg-blue-600 text-white" : "border-gray-300"}`}
                        >
                          여성
                        </Button>
                      </div>
                    )}
                  />
                  {errors.gender && (
                    <p className="text-xs text-red-500">{errors.gender.message}</p>
                  )}
                </div>

                {/* 약관 동의 */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    약관 동의
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="terms"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="terms"
                            checked={field.value === true}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? true : undefined)
                            }
                          />
                        )}
                      />
                      <Label htmlFor="terms" className="text-sm text-gray-700">
                        <span className="text-red-500">[필수]</span> 이용약관에
                        동의합니다.
                      </Label>
                      <Link
                        href="#"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        보기
                      </Link>
                    </div>
                    {errors.terms && (
                      <p className="text-xs text-red-500 ml-6">
                        {errors.terms.message}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="privacy"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="privacy"
                            checked={field.value === true}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? true : undefined)
                            }
                          />
                        )}
                      />
                      <Label
                        htmlFor="privacy"
                        className="text-sm text-gray-700"
                      >
                        <span className="text-red-500">[필수]</span> 개인정보
                        수집 및 이용에 동의합니다.
                      </Label>
                      <Link
                        href="#"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        보기
                      </Link>
                    </div>
                    {errors.privacy && (
                      <p className="text-xs text-red-500 ml-6">
                        {errors.privacy.message}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="marketing"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="marketing"
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                          />
                        )}
                      />
                      <Label
                        htmlFor="marketing"
                        className="text-sm text-gray-700"
                      >
                        [선택] 마케팅 정보 수신에 동의합니다.
                      </Label>
                    </div>
                  </div>
                </div>

                {/* 회원가입 버튼 */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-8"
                  size="lg"
                >
                  {isSubmitting ? "회원가입 중..." : "회원가입 완료"}
                </Button>

                {/* 추가 링크 */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    이미 RAILLO 회원이신가요?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      로그인하기
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
