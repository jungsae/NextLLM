import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 쿠키에서 특정 값을 추출하는 함수
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Supabase JWT 토큰에서 사용자 정보 추출
export function extractUserFromToken(token: string | null): { id?: string; email?: string } | null {
  if (!token) return null;

  try {
    // JWT 토큰의 payload 부분 추출 (두 번째 부분)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('유효하지 않은 JWT 토큰 형식:', token.substring(0, 50) + '...');
      return null;
    }

    const payload = parts[1];
    if (!payload) return null;

    // Base64 디코딩 (패딩 추가)
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = JSON.parse(atob(paddedPayload));

    console.log('JWT 토큰 파싱 결과:', {
      sub: decodedPayload.sub,
      user_id: decodedPayload.user_id,
      email: decodedPayload.email,
      aud: decodedPayload.aud
    });

    return {
      id: decodedPayload.sub || decodedPayload.user_id,
      email: decodedPayload.email
    };
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
    console.log('파싱 실패한 토큰:', token.substring(0, 100) + '...');
    return null;
  }
}

// 쿠키에서 사용자 정보 추출
export function getUserFromCookies(): { id?: string; email?: string } | null {
  // Supabase 관련 쿠키들 확인 (다양한 패턴 지원)
  const allCookies = getAllCookies();

  // Supabase 쿠키 패턴 찾기
  const supabaseCookies = Object.keys(allCookies).filter(key =>
    key.includes('sb-') && key.includes('-auth-token')
  );

  console.log('발견된 Supabase 쿠키들:', supabaseCookies);

  let accessToken: string | null = null;

  // 가능한 쿠키 이름들
  const possibleTokenNames = [
    'sb-access-token',
    'supabase-auth-token',
    ...supabaseCookies // 실제 발견된 쿠키들
  ];

  for (const cookieName of possibleTokenNames) {
    const token = getCookie(cookieName);
    if (token) {
      console.log(`토큰 발견: ${cookieName}`);
      accessToken = token;
      break;
    }
  }

  if (accessToken) {
    return extractUserFromToken(accessToken);
  }

  console.log('토큰을 찾을 수 없습니다. 모든 쿠키:', allCookies);
  return null;
}

// 모든 쿠키 정보를 객체로 반환
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  const cookies: Record<string, string> = {};
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}

// WebSocket URL 생성 함수
export const getWebSocketUrl = (userId: string) => {
  // ngrok URL 사용 (개발 환경)
  if (process.env.NODE_ENV === 'development') {
    const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL || 'https://59d1-183-101-77-17.ngrok-free.app';
    // ngrok HTTPS를 WSS로 변환
    return ngrokUrl.replace('https://', 'wss://') + `/ws?userId=${userId}`;
  }

  // 프로덕션 환경
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/ws?userId=${userId}`;
};

// API URL 생성 함수
export const getApiUrl = () => {
  // ngrok URL 사용 (개발 환경)
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_NGROK_URL || 'https://59d1-183-101-77-17.ngrok-free.app';
  }

  // 프로덕션 환경
  return `${window.location.protocol}//${window.location.host}`;
};
