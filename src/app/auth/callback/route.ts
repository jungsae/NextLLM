import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    const supabaseResponse = NextResponse.redirect(new URL('/', requestUrl.origin))

    if (code) {
        const supabase = await createServerSupabaseClient(request, supabaseResponse)
        await supabase.auth.exchangeCodeForSession(code)
    }

    return supabaseResponse
} 