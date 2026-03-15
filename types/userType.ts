// ========== 회원 정보 ==========

export interface MemberDetailInfo {
  memberNo: string;
  membership: string;
  email: string;
  birthDate: string;
  gender: "M" | "F";
  totalMileage: number;
}

export interface MemberInfoResponse {
  name: string;
  phoneNumber: string;
  role: string;
  memberDetailInfo: MemberDetailInfo;
}

export interface MemberInfo {
  memberId: string;
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  memberGrade: string;
  mileage: number;
}
