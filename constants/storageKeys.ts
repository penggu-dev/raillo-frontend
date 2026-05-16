export const LOCAL_STORAGE_KEYS = {
  SEARCH_HISTORY: "rail-o-search-history",
  SIGNUP_MEMBER_NUMBER: "signupMemberNo",
  TOSS_CUSTOMER_KEY: "tossCustomerKey",
} as const;

export const SESSION_STORAGE_KEYS = {
  FOUND_MEMBER_NUMBER: "foundMemberNo",
  PASSWORD_RESET_TOKEN: "tempPasswordToken",
  PASSWORD_RESET_EMAIL: "tempPasswordEmail",
  IDENTITY_VERIFIED: "emailVerified",
  IDENTITY_VERIFIED_FOR: "emailVerifiedFor",
} as const;
