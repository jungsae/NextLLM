import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
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
                        })
                    },
                },
            }
        );

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