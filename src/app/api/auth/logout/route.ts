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

        // 추가로 클라이언트 쿠키도 제거
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');
        response.cookies.delete('supabase-auth-token');

        return response;
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);

        // 오류가 발생해도 로그아웃 응답 반환
        const response = NextResponse.json({
            success: true,
            message: '로그아웃되었습니다.'
        });

        // 쿠키 제거
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');
        response.cookies.delete('supabase-auth-token');

        return response;
    }
} 