import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// 크롤링 서버에서 상품 데이터 저장
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, products } = body;

        if (!sessionId || !products || !Array.isArray(products)) {
            return NextResponse.json(
                { success: false, error: '세션 ID와 상품 데이터가 필요합니다.' },
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

        // 세션 소유자 확인
        const { data: sessionData, error: sessionError } = await supabase
            .from('crawling_sessions')
            .select('user_id, product_count')
            .eq('id', sessionId)
            .single();

        if (sessionError || !sessionData) {
            return NextResponse.json(
                { success: false, error: '크롤링 세션을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        if (sessionData.user_id !== session.user.id) {
            return NextResponse.json(
                { success: false, error: '권한이 없습니다.' },
                { status: 403 }
            );
        }

        // 상품 데이터에 crawling_session_id 추가
        const productsWithSession = products.map((product: any) => ({
            ...product,
            crawling_session_id: sessionId,
            price_numeric: product.price_numeric || parseInt(product.price?.replace(/[^0-9]/g, '') || '0'),
            created_at: new Date().toISOString()
        }));

        // 상품 데이터 저장
        const { data: insertedProducts, error: insertError } = await supabase
            .from('products')
            .insert(productsWithSession)
            .select();

        if (insertError) {
            console.error('상품 저장 오류:', insertError);
            return NextResponse.json(
                { success: false, error: '상품을 저장하는데 실패했습니다.' },
                { status: 500 }
            );
        }

        // 세션의 product_count 업데이트
        const { error: updateError } = await supabase
            .from('crawling_sessions')
            .update({
                product_count: sessionData.product_count + products.length,
                status: 'completed'
            })
            .eq('id', sessionId);

        if (updateError) {
            console.error('세션 업데이트 오류:', updateError);
        }

        return NextResponse.json({
            success: true,
            data: {
                insertedCount: insertedProducts?.length || 0,
                sessionId: sessionId
            }
        });

    } catch (error) {
        console.error('API 오류:', error);
        return NextResponse.json(
            { success: false, error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 