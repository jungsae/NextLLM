import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase';
import { AuthenticationError } from '@/lib/errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_LLM_API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        // 인증 확인
        const user = await getAuthenticatedUser(request);
        if (!user) {
            throw new AuthenticationError('인증이 필요합니다.');
        }

        const { jobId } = await params;

        // 백엔드 API 호출
        const response = await fetch(`${API_BASE_URL}/api/llm-responses/job/${jobId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Job ID로 LLM Response 조회 실패:', error);

        if (error instanceof AuthenticationError) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'LLM Response 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 