"use client";

import Link from "next/link";

const SignupGuide = () => {
  return (
    <p className="text-sm text-muted-foreground text-center mt-10">
      아직 RAILLO 회원이 아니신가요?{" "}
      <Link
        href="/signup"
        className="text-primary hover:text-primary-active font-semibold"
      >
        회원가입하기
      </Link>
    </p>
  );
};

export default SignupGuide;
