import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// 크롤링 세션 목록 조회
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const userId = searchParams.get('userId');

        // 인증된 사용자 확인
        const supabaseResponse = NextResponse.next({ request });
        const supabase = await createServerSupabaseClient(request, supabaseResponse);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json(
                { success: false, error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 세션 ID가 있으면 해당 세션의 상품들 조회
        if (sessionId) {
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('crawling_session_id', sessionId)
                .order('created_at', { ascending: false });

            if (productsError) {
                console.error('상품 조회 오류:', productsError);
                return NextResponse.json(
                    { success: false, error: '상품을 불러오는데 실패했습니다.' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                data: products || []
            });
        }

        // 세션 ID가 없으면 사용자의 크롤링 세션 목록 조회
        if (!userId) {
            return NextResponse.json(
                { success: false, error: '사용자 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        // 현재 로그인한 사용자와 요청한 사용자가 같은지 확인
        if (session.user.id !== userId) {
            return NextResponse.json(
                { success: false, error: '권한이 없습니다.' },
                { status: 403 }
            );
        }

        const { data: sessions, error: sessionsError } = await supabase
            .from('crawling_sessions')
            .select(`
                id,
                name,
                created_at,
                product_count,
                status
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (sessionsError) {
            console.error('크롤링 세션 조회 오류:', sessionsError);
            return NextResponse.json(
                { success: false, error: '크롤링 세션을 불러오는데 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: sessions || []
        });

    } catch (error) {
        console.error('API 오류:', error);
        return NextResponse.json(
            { success: false, error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 새로운 크롤링 세션 생성
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, userId } = body;

        if (!name || !userId) {
            return NextResponse.json(
                { success: false, error: '세션 이름과 사용자 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        // 인증된 사용자 확인
        const supabaseResponse = NextResponse.next({ request });
        const supabase = await createServerSupabaseClient(request, supabaseResponse);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json(
                { success: false, error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 현재 로그인한 사용자와 요청한 사용자가 같은지 확인
        if (session.user.id !== userId) {
            return NextResponse.json(
                { success: false, error: '권한이 없습니다.' },
                { status: 403 }
            );
        }

        const { data: sessionData, error: sessionError } = await supabase
            .from('crawling_sessions')
            .insert({
                name,
                user_id: userId,
                status: 'active',
                product_count: 0
            })
            .select()
            .single();

        if (sessionError) {
            console.error('세션 생성 오류:', sessionError);
            return NextResponse.json(
                { success: false, error: '크롤링 세션을 생성하는데 실패했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: sessionData
        });

    } catch (error) {
        console.error('API 오류:', error);
        return NextResponse.json(
            { success: false, error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 