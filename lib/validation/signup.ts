import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(1, "이름은 필수입니다."),
    email: z
      .string()
      .min(1, "이메일은 필수입니다.")
      .email("올바른 이메일 형식이 아닙니다."),
    password: z
      .string()
      .min(1, "비밀번호는 필수입니다.")
      .min(8, "비밀번호는 8자 이상이어야 합니다."),
    confirmPassword: z.string().min(1, "비밀번호 확인은 필수입니다."),
    phoneNumber: z.string().refine(
      (val) => {
        const digits = val.replace(/[^0-9]/g, "");
        return digits.length === 11;
      },
      { message: "전화번호는 11자리 숫자여야 합니다." }
    ),
    birthDate: z
      .string()
      .min(1, "생년월일은 필수입니다.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "생년월일을 모두 선택해주세요."),
    gender: z.enum(["M", "F"], { message: "성별을 선택해주세요." }),
    terms: z.literal(true, { message: "이용약관에 동의해주세요." }),
    privacy: z.literal(true, { message: "개인정보 수집 및 이용에 동의해주세요." }),
    marketing: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

// 휴대폰 번호에 하이픈 추가하는 함수
export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  const limited = numbers.slice(0, 11);

  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 7) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
  }
};

// 휴대폰 번호에서 하이픈 제거하는 함수
export const removePhoneNumberFormatting = (phoneNumber: string): string => {
  return phoneNumber.replace(/[^0-9]/g, "");
};
