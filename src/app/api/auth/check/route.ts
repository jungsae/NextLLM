import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = await createServerSupabaseClient(request, supabaseResponse);

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const isLoggedIn = !!session;

        return NextResponse.json({
            isLoggedIn,
            user: session?.user || null,
            message: isLoggedIn ? '로그인된 상태입니다.' : '로그인이 필요합니다.'
        });
    } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
        return NextResponse.json(
            {
                isLoggedIn: false,
                user: null,
                message: '로그인 상태 확인 중 오류가 발생했습니다.'
            },
            { status: 500 }
        );
    }
} 