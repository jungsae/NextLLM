import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    const supabaseResponse = NextResponse.redirect(new URL('/', requestUrl.origin))

    if (code) {
        try {
            const supabase = await createServerSupabaseClient(request, supabaseResponse)
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('인증 코드 교환 실패:', error)
                // 에러 시 로그인 페이지로 리다이렉트
                return NextResponse.redirect(new URL('/auth', requestUrl.origin))
            }

            if (data.user) {
                console.log('로그인 성공:', data.user.email)
            }
        } catch (error) {
            console.error('인증 처리 중 오류:', error)
            return NextResponse.redirect(new URL('/auth', requestUrl.origin))
        }
    }

    return supabaseResponse
} 