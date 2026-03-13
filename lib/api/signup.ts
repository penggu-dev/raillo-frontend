import { api } from '../api';
import type { SignupRequest, SignupResult } from '@/types/authType';

// 회원가입 API 함수
export const signup = async (signupData: SignupRequest): Promise<SignupResult> => {
  try {
    const response = await api.post<SignupResult>('/auth/signup', signupData);
    
    if (response.result) {
      return response.result;
    }
    
    throw new Error(response.message || '회원가입에 실패했습니다.');
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}; 
