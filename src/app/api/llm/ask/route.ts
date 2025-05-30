import axios from 'axios';
import { NextResponse } from 'next/server';
import { serverState } from './state';

// POST 요청만 처리하도록 설정 (다른 메소드 필요시 추가)
export async function POST(request: Request) {
    try {
        // 서버가 이미 처리 중인지 확인
        if (serverState.isProcessing()) {
            const queuePosition = serverState.getQueuePosition();
            return NextResponse.json({
                error: 'Server is busy',
                queuePosition,
                message: '다른 사용자가 현재 요청을 처리 중입니다. 잠시 후 다시 시도해주세요.'
            }, { status: 429 });
        }

        // 1. 프론트엔드에서 보낸 요청 본문(JSON) 파싱
        const body = await request.json();
        const userPrompt = body.prompt;
        const maxTokens = body.max_tokens || 150; // 기본값 또는 요청 시 전달된 값 사용

        if (!userPrompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // 2. 환경 변수에서 실제 LLM API 주소 가져오기
        const llmApiUrl = process.env.LOCAL_LLM_API_URL;
        if (!llmApiUrl) {
            console.error("Fatal: LOCAL_LLM_API_URL environment variable is not set.");
            return NextResponse.json({ error: 'LLM API URL not configured on server' }, { status: 500 });
        }

        // 처리 시작 표시
        serverState.setProcessing(true);

        try {
            // 3. 로컬 LLM API 서버에 보낼 데이터 준비
            const llmPayload = {
                messages: [{ role: 'user', content: userPrompt }],
                mode: 'instruct', // 모델에 맞게 조정 필요 시 변경
                max_tokens: maxTokens
            };

            console.log(`[API Route] Forwarding to LLM: ${llmApiUrl} with prompt: "${userPrompt}"`);
            const response = await axios.post(llmApiUrl, llmPayload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 540000 // 9분으로 타임아웃 설정 (Vercel의 10분 제한을 고려)
            });

            if (response.data) {
                console.log(`[API Route] Received from LLM: "${JSON.stringify(response.data).substring(0, 100)}..."`);
                return NextResponse.json(response.data);
            } else {
                console.error('[API Route] Invalid LLM API response structure:', response.data);
                throw new Error('Invalid response structure from LLM API');
            }
        } finally {
            // 처리 완료 표시
            serverState.setProcessing(false);
        }

    } catch (error: any) {
        // 처리 완료 표시
        serverState.setProcessing(false);

        // 6. 에러 처리
        console.error('[API Route] Error processing LLM request:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
        let errorMessage = 'Failed to get response from LLM';
        let statusCode = 500;

        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED') {
                errorMessage = 'Connection to the local LLM server was refused. Is it running?';
                statusCode = 503;
            } else if (error.code === 'ETIMEDOUT' || error.response?.status === 504) {
                errorMessage = 'Request to the local LLM server timed out.';
                statusCode = 504;
            } else if (error.response) {
                errorMessage = `LLM API responded with status ${error.response.status}`;
                statusCode = 500;
            }
        }
        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}