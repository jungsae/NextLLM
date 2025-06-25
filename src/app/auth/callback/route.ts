import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get: (name: string) => cookieStore.get(name)?.value,
                    set: (name: string, value: string, options: any) => {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove: (name: string, options: any) => {
                        cookieStore.delete({ name, ...options })
                    },
                },
            }
        )
        await supabase.auth.exchangeCodeForSession(code)
    }

    // 로그인 성공 후 대시보드로 리디렉션
    return NextResponse.redirect(new URL('/', requestUrl.origin))
} 