import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, validateUserAccess, sanitizeInput } from '@/lib/supabase';
import { ValidationError, AuthenticationError, AuthorizationError, NotFoundError, handleApiError } from '@/lib/errors';

// 크롤링 서버에서 상품 데이터 저장
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, products } = body;

        // 입력값 검증
        if (!sessionId || !products || !Array.isArray(products)) {
            throw new ValidationError('세션 ID와 상품 데이터가 필요합니다.');
        }

        const sanitizedSessionId = sanitizeInput(sessionId as string);
        if (!sanitizedSessionId) {
            throw new ValidationError('유효하지 않은 세션 ID입니다.');
        }

        // 인증된 사용자 확인
        const supabaseResponse = NextResponse.next({ request });
        const { user, error: authError } = await getAuthenticatedUser(request, supabaseResponse);

        if (authError || !user) {
            throw new AuthenticationError();
        }

        const supabase = await createServerSupabaseClient(request, supabaseResponse);

        // 세션 소유자 확인
        const { data: sessionData, error: sessionError } = await supabase
            .from('crawling_sessions')
            .select('user_email, product_count')
            .eq('id', sanitizedSessionId)
            .single();

        if (sessionError || !sessionData) {
            throw new NotFoundError('크롤링 세션을 찾을 수 없습니다.');
        }

        // 세션 소유자 권한 확인
        const { hasAccess, error: accessError } = validateUserAccess(user, sessionData.user_email);
        if (!hasAccess) {
            throw new AuthorizationError(accessError || '권한이 없습니다.');
        }

        // 상품 데이터 검증 및 정제
        const validatedProducts = products.map((product: any) => {
            if (!product || typeof product !== 'object') {
                throw new ValidationError('유효하지 않은 상품 데이터입니다.');
            }

            return {
                ...product,
                crawling_session_id: sanitizedSessionId,
                user_email: user.email,
                price_numeric: product.price_numeric || parseInt(String(product.price || '0').replace(/[^0-9]/g, '')),
                created_at: new Date().toISOString()
            };
        });

        // 상품 데이터 저장
        const { data: insertedProducts, error: insertError } = await supabase
            .from('products')
            .insert(validatedProducts)
            .select();

        if (insertError) {
            console.error('상품 저장 오류:', insertError);
            throw new ValidationError('상품을 저장하는데 실패했습니다.');
        }

        // 세션의 product_count 업데이트
        const { error: updateError } = await supabase
            .from('crawling_sessions')
            .update({
                product_count: sessionData.product_count + products.length,
                status: 'completed'
            })
            .eq('id', sanitizedSessionId);

        if (updateError) {
            console.error('세션 업데이트 오류:', updateError);
        }

        return NextResponse.json({
            success: true,
            data: {
                insertedCount: insertedProducts?.length || 0,
                sessionId: sanitizedSessionId
            }
        });

    } catch (error) {
        const errorResponse = handleApiError(error);
        return NextResponse.json(
            { success: false, error: errorResponse.error },
            { status: errorResponse.statusCode }
        );
    }
} 