import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        // 쿠키를 포함한 응답 생성
        const response = NextResponse.json({
            success: true,
            message: '로그아웃되었습니다.'
        });

        // Supabase 세션 쿠키 제거
        const supabase = await createServerSupabaseClient(request, response);

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Supabase 로그아웃 오류:', error);
            // Supabase 오류가 있어도 클라이언트 쿠키는 제거
        }

        // 쿠키 삭제를 위한 만료 옵션
        const expireOptions = {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            httpOnly: true,
            expires: new Date(0) // 과거 시간으로 설정하여 즉시 만료
        };

        // Supabase 관련 쿠키들 제거
        response.cookies.set('sb-access-token', '', expireOptions);
        response.cookies.set('sb-refresh-token', '', expireOptions);
        response.cookies.set('supabase-auth-token', '', expireOptions);
        response.cookies.set('supabase-auth-refresh-token', '', expireOptions);

        // Vercel 환경에서 도메인별 쿠키도 제거
        if (process.env.NODE_ENV === 'production') {
            const domainExpireOptions = {
                ...expireOptions,
                domain: '.vercel.app'
            };

            response.cookies.set('sb-access-token', '', domainExpireOptions);
            response.cookies.set('sb-refresh-token', '', domainExpireOptions);
            response.cookies.set('supabase-auth-token', '', domainExpireOptions);
        }

        return response;
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);

        // 오류가 발생해도 로그아웃 응답 반환
        const response = NextResponse.json({
            success: true,
            message: '로그아웃되었습니다.'
        });

        // 쿠키 제거 (오류 시에도 동일한 옵션 적용)
        const expireOptions = {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            httpOnly: true,
            expires: new Date(0)
        };

        response.cookies.set('sb-access-token', '', expireOptions);
        response.cookies.set('sb-refresh-token', '', expireOptions);
        response.cookies.set('supabase-auth-token', '', expireOptions);
        response.cookies.set('supabase-auth-refresh-token', '', expireOptions);

        return response;
    }
} 