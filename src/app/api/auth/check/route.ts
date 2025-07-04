import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase';
import { AuthenticationError, handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
    const supabaseResponse = NextResponse.next({
        request,
    });

    try {
        const { user, error } = await getAuthenticatedUser(request, supabaseResponse);

        // 인증 오류가 있으면 예외로 처리 (AuthSessionMissingError는 이미 헬퍼에서 처리됨)
        if (error) {
            throw new AuthenticationError('인증 확인 중 오류가 발생했습니다.');
        }

        const isLoggedIn = !!user;

        // 로그인 여부와 관계없이 200 상태 코드로 응답
        return NextResponse.json({
            isLoggedIn,
            user: user || null,
            message: isLoggedIn ? '로그인된 상태입니다.' : '로그인이 필요합니다.'
        });
    } catch (error) {
        const errorResponse = handleApiError(error);
        return NextResponse.json(
            {
                isLoggedIn: false,
                user: null,
                message: errorResponse.error
            },
            { status: errorResponse.statusCode }
        );
    }
} 