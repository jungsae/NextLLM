import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const supabaseResponse = NextResponse.next({
            request,
        });

        const supabase = await createServerSupabaseClient(request, supabaseResponse);

        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: '로그아웃되었습니다.'
        });
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        return NextResponse.json(
            {
                success: false,
                message: '로그아웃 중 오류가 발생했습니다.'
            },
            { status: 500 }
        );
    }
} 