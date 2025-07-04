import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser, validateUserAccess, sanitizeInput } from '@/lib/supabase';
import { ValidationError, AuthenticationError, AuthorizationError, handleApiError } from '@/lib/errors';

// 크롤링 세션 목록 조회
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const userEmail = searchParams.get('userEmail');

        // 입력값 정제
        const sanitizedSessionId = sessionId ? sanitizeInput(sessionId) : null;
        const sanitizedUserEmail = userEmail ? sanitizeInput(userEmail) : null;

        // 인증된 사용자 확인
        const supabaseResponse = NextResponse.next({ request });
        const { user, error: authError } = await getAuthenticatedUser(request, supabaseResponse);

        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 세션 ID가 있으면 해당 세션의 상품들 조회
        if (sanitizedSessionId && sanitizedSessionId.length > 0) {
            const supabase = await createServerSupabaseClient(request, supabaseResponse);
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('crawling_session_id', sanitizedSessionId)
                .order('created_at', { ascending: false });

            if (productsError) {
                console.error('상품 조회 오류:', productsError);
                throw new ValidationError('상품을 불러오는데 실패했습니다.');
            }

            return NextResponse.json({
                success: true,
                data: products || []
            });
        }

        // 세션 ID가 없으면 사용자의 크롤링 세션 목록 조회
        if (!sanitizedUserEmail || sanitizedUserEmail.length === 0) {
            throw new ValidationError('사용자 이메일이 필요합니다.');
        }

        // 현재 로그인한 사용자와 요청한 사용자가 같은지 확인
        const { hasAccess, error: accessError } = validateUserAccess(user, sanitizedUserEmail);
        if (!hasAccess) {
            throw new AuthorizationError(accessError || '권한이 없습니다.');
        }

        const supabase = await createServerSupabaseClient(request, supabaseResponse);
        const { data: sessions, error: sessionsError } = await supabase
            .from('crawling_sessions')
            .select(`
                id,
                name,
                created_at,
                product_count,
                status
            `)
            .eq('user_email', sanitizedUserEmail)
            .order('created_at', { ascending: false });

        if (sessionsError) {
            console.error('크롤링 세션 조회 오류:', sessionsError);
            throw new ValidationError('크롤링 세션을 불러오는데 실패했습니다.');
        }

        return NextResponse.json({
            success: true,
            data: sessions || []
        });

    } catch (error) {
        const errorResponse = handleApiError(error);
        return NextResponse.json(
            { success: false, error: errorResponse.error },
            { status: errorResponse.statusCode }
        );
    }
}

// 새로운 크롤링 세션 생성
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, userEmail } = body;

        // 입력값 검증 및 정제
        if (!name || !userEmail) {
            throw new ValidationError('세션 이름과 사용자 이메일이 필요합니다.');
        }

        const sanitizedName = sanitizeInput(name);
        const sanitizedUserEmail = sanitizeInput(userEmail);

        if (!sanitizedName || !sanitizedUserEmail) {
            throw new ValidationError('유효하지 않은 입력값입니다.');
        }

        // 인증된 사용자 확인
        const supabaseResponse = NextResponse.next({ request });
        const { user, error: authError } = await getAuthenticatedUser(request, supabaseResponse);

        if (authError || !user) {
            throw new AuthenticationError();
        }

        // 현재 로그인한 사용자와 요청한 사용자가 같은지 확인
        const { hasAccess, error: accessError } = validateUserAccess(user, sanitizedUserEmail);
        if (!hasAccess) {
            throw new AuthorizationError(accessError || '권한이 없습니다.');
        }

        const supabase = await createServerSupabaseClient(request, supabaseResponse);
        const { data: sessionData, error: sessionError } = await supabase
            .from('crawling_sessions')
            .insert({
                name: sanitizedName,
                user_email: sanitizedUserEmail,
                status: 'active',
                product_count: 0
            })
            .select()
            .single();

        if (sessionError) {
            console.error('세션 생성 오류:', sessionError);
            throw new ValidationError('크롤링 세션을 생성하는데 실패했습니다.');
        }

        return NextResponse.json({
            success: true,
            data: sessionData
        });

    } catch (error) {
        const errorResponse = handleApiError(error);
        return NextResponse.json(
            { success: false, error: errorResponse.error },
            { status: errorResponse.statusCode }
        );
    }
} 