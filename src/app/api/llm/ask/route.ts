import axios from 'axios';
import { NextResponse } from 'next/server';
import { serverState } from './state';
import { getAuthenticatedUser } from '@/lib/supabase';
import { AuthenticationError, handleApiError } from '@/lib/errors';

// POST 요청만 처리하도록 설정 (다른 메소드 필요시 추가)
export async function POST(request: Request) {
    try {
        // 사용자 인증 확인
        const { user, error: authError } = await getAuthenticatedUser(request as any);

        if (authError || !user) {
            throw new AuthenticationError('인증이 필요합니다.');
        }

        // 서버가 이미 처리 중인지 확인
        if (serverState.isProcessing()) {
            const queuePosition = serverState.getQueuePosition();
            return NextResponse.json({
                error: 'Server is busy',
                queuePosition,
                message: '다른 사용자가 현재 요청을 처리 중입니다. 잠시 후 다시 시도해주세요.'
            }, { status: 429 });
        }

        const body = await request.json();
        const userPrompt = body.prompt;

        if (!userPrompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const llmApiUrl = process.env.LOCAL_LLM_API_URL || 'https://59d1-183-101-77-17.ngrok-free.app';
        if (!llmApiUrl) {
            console.error("Fatal: 로컬 LLM API URL 환경 변수가 설정되지 않았습니다.");
            return NextResponse.json({ error: 'LLM API URL not configured on server' }, { status: 500 });
        }

        serverState.setProcessing(true);

        try {
            const llmPayload = {
                messages: [{ role: 'user', content: userPrompt }],
                priority: Math.floor(Math.random() * 10),
                user_id: user.id,
            };

            console.log(`[API Route] 사용자 ${user.email}(${user.id})가 LLM 요청을 보냄: ${llmApiUrl + '/api/jobs'}`);
            console.log(`[API Route] 요청 내용: "${userPrompt}"`);

            const response = await axios.post(llmApiUrl + '/api/jobs', llmPayload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data) {
                console.log("=== LLM API 응답 상세 정보 ===");
                console.log("사용자:", user.email);
                console.log("응답 상태:", response.status);
                console.log("응답 헤더:", response.headers);
                console.log("응답 데이터 타입:", typeof response.data);
                console.log("응답 데이터:", JSON.stringify(response.data, null, 2));
                console.log("=== 응답 정보 끝 ===");

                return NextResponse.json(response.data);
            } else {
                console.error('[API Route] Invalid LLM API response structure:', response.data);
                throw new Error('Invalid response structure from LLM API');
            }
        } finally {
            serverState.setProcessing(false);
        }

    } catch (error: any) {
        serverState.setProcessing(false);

        console.error('[API Route] Error processing LLM request:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);

        // 커스텀 에러 처리
        const errorResponse = handleApiError(error);
        return NextResponse.json(
            { error: errorResponse.error },
            { status: errorResponse.statusCode }
        );
    }
}