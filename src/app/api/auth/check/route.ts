import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const supabaseResponse = NextResponse.next({
        request,
    });

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
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    );

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