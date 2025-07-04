import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { User } from '@supabase/supabase-js'

// 브라우저용 클라이언트
export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// 서버용 클라이언트 (쿠키 기반)
export const createServerSupabaseClient = async (request?: NextRequest, response?: NextResponse) => {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options)
                        if (response) {
                            response.cookies.set(name, value, options)
                        }
                    })
                },
            },
        }
    )
}

// 안전한 사용자 인증 확인 헬퍼 함수
export const getAuthenticatedUser = async (request: NextRequest, response?: NextResponse) => {
    try {
        const supabase = await createServerSupabaseClient(request, response);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            // AuthSessionMissingError는 로그인하지 않은 상태를 의미하므로 정상 처리
            if (error.message === 'Auth session missing!') {
                return { user: null, error: null };
            }

            console.error('사용자 인증 확인 오류:', error);
            return { user: null, error };
        }

        // 추가 보안 검증: 사용자 이메일이 유효한지 확인
        if (user && !isValidEmail(user.email)) {
            console.error('유효하지 않은 사용자 이메일:', user.email);
            return { user: null, error: new Error('유효하지 않은 사용자 정보입니다.') };
        }

        return { user, error: null };
    } catch (error) {
        console.error('인증 확인 중 예외 발생:', error);
        return { user: null, error };
    }
}

// 사용자 권한 확인 헬퍼 함수
export const validateUserAccess = (authenticatedUser: User | null, requestedEmail: string) => {
    if (!authenticatedUser) {
        return { hasAccess: false, error: '인증이 필요합니다.' };
    }

    if (!authenticatedUser.email) {
        return { hasAccess: false, error: '유효하지 않은 사용자 정보입니다.' };
    }

    if (authenticatedUser.email !== requestedEmail) {
        return { hasAccess: false, error: '권한이 없습니다.' };
    }

    return { hasAccess: true, error: null };
}

// 이메일 유효성 검증 함수
export const isValidEmail = (email: string | null | undefined): boolean => {
    if (!email) return false;

    // 기본적인 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    // 추가 보안 검증: 특수 문자나 스크립트 태그 방지
    if (email.includes('<') || email.includes('>') || email.includes('script')) {
        return false;
    }

    return true;
}

// 입력값 정제 함수 (XSS 방지)
export const sanitizeInput = (input: string | null | undefined): string => {
    if (!input || typeof input !== 'string') return '';

    return input
        .replace(/[<>]/g, '') // HTML 태그 제거
        .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
        .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
        .trim();
} 