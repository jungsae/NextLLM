import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase';
import { AuthenticationError } from '@/lib/errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_LLM_API_URL;

export async function GET(request: NextRequest) {
    try {
        // 인증 확인
        const user = await getAuthenticatedUser(request);
        if (!user) {
            throw new AuthenticationError('인증이 필요합니다.');
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'startDate와 endDate 파라미터가 필요합니다.' },
                { status: 400 }
            );
        }

        // 백엔드 API 호출
        const response = await fetch(
            `${API_BASE_URL}/api/llm-responses/stats/models?startDate=${startDate}&endDate=${endDate}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('모델별 사용량 통계 조회 실패:', error);

        if (error instanceof AuthenticationError) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: error.message || '모델별 사용량 통계 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 