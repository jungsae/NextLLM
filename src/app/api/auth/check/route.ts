import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const supabaseResponse = NextResponse.next({
        request,
    });

    try {
        const { user, error } = await getAuthenticatedUser(request, supabaseResponse);

        // 사용자가 존재하지 않는 경우 (삭제된 사용자 등)
        if (error && typeof error === 'object' && 'message' in error && error.message === 'User from sub claim in JWT does not exist') {
            console.log('사용자가 존재하지 않습니다. 로그아웃 상태로 처리합니다.');
            return NextResponse.json({
                isLoggedIn: false,
                user: null,
                message: '사용자 정보가 유효하지 않습니다. 다시 로그인해주세요.'
            });
        }

        // 기타 인증 오류
        if (error) {
            console.error('인증 확인 오류:', error);
            return NextResponse.json({
                isLoggedIn: false,
                user: null,
                message: '인증 확인 중 오류가 발생했습니다.'
            });
        }

        const isLoggedIn = !!user;

        // 로그인 여부와 관계없이 200 상태 코드로 응답
        return NextResponse.json({
            isLoggedIn,
            user: user || null,
            message: isLoggedIn ? '로그인된 상태입니다.' : '로그인이 필요합니다.'
        });
    } catch (error) {
        console.error('API 오류:', error);
        return NextResponse.json(
            {
                isLoggedIn: false,
                user: null,
                message: '인증 확인 중 오류가 발생했습니다.'
            },
            { status: 200 } // 에러가 있어도 200 상태 코드로 응답
        );
    }
} 