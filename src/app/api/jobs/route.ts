import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase';
import { AuthenticationError, ValidationError, handleApiError } from '@/lib/errors';
import { JobCreateRequest, JobResponse } from '@/types/job';

export async function POST(request: NextRequest) {
    try {
        // 사용자 인증 확인
        const { user, error: authError } = await getAuthenticatedUser(request);

        if (authError || !user) {
            throw new AuthenticationError('인증이 필요합니다.');
        }

        const body: JobCreateRequest = await request.json();
        const { messages, priority = 3 } = body;

        // 입력값 검증
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new ValidationError('메시지가 필요합니다.');
        }

        const userMessage = messages[0];
        if (!userMessage || !userMessage.content.trim()) {
            throw new ValidationError('사용자 메시지가 필요합니다.');
        }

        // 백엔드 LLM 서버에 작업 생성 요청
        const llmApiUrl = process.env.LOCAL_LLM_API_URL || 'http://localhost:8080';
        if (!llmApiUrl) {
            throw new ValidationError('LLM API URL이 설정되지 않았습니다.');
        }

        const jobPayload = {
            messages: [{ role: 'user', content: userMessage.content }],
            priority: priority,
            user_id: user.id
            // max_tokens와 temperature는 백엔드에서 안전한 기본값으로 설정
        };

        console.log(`[Jobs API] 사용자 ${user.id}가 작업 생성 요청:`, jobPayload);

        // 인증 헤더 준비
        const authHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // 쿠키에서 인증 토큰 추출하여 백엔드로 전달
        const cookies = request.headers.get('cookie');
        if (cookies) {
            authHeaders['Cookie'] = cookies;
        }

        // Authorization 헤더가 있으면 전달
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
            authHeaders['Authorization'] = authHeader;
        }

        const response = await fetch(`${llmApiUrl}/api/jobs`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(jobPayload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ValidationError(errorData.error || '작업 생성에 실패했습니다.');
        }

        const jobData: JobResponse = await response.json();

        console.log(`[Jobs API] 작업 생성 성공:`, jobData);

        return NextResponse.json({
            success: true,
            data: {
                id: jobData.id,
                status: jobData.status,
                message: jobData.message,
                userId: user.id
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