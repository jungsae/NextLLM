import axios from 'axios';
import { NextResponse } from 'next/server';

// POST 요청만 처리하도록 설정 (다른 메소드 필요시 추가)
export async function POST(request: Request) {
    try {
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

        // 3. 로컬 LLM API 서버에 보낼 데이터 준비
        const llmPayload = {
            messages: [{ role: 'user', content: userPrompt }],
            mode: 'instruct', // 모델에 맞게 조정 필요 시 변경
            max_tokens: maxTokens,
            // stream: false // 스트리밍이 필요하면 true로 설정하고 다르게 처리
        };

        // 4. axios를 사용하여 로컬 LLM API 서버에 POST 요청 보내기 (서버 -> 서버 통신)
        console.log(`[API Route] Forwarding to LLM: ${llmApiUrl} with prompt: "${userPrompt}"`);
        const response = await axios.post(llmApiUrl, llmPayload, {
            headers: {
                'Content-Type': 'application/json',
                // 미니PC Nginx에서 별도 인증 헤더 요구 시 여기에 추가
            },
            timeout: 180000 // 타임아웃 3분 (N100이 느릴 수 있으므로 넉넉하게)
        });

        // 5. LLM API 응답 처리 및 프론트엔드에 반환
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const llmResponseContent = response.data.choices[0].message.content;
            console.log(`[API Route] Received from LLM: "${llmResponseContent.substring(0, 50)}..."`);
            return NextResponse.json({ response: llmResponseContent });
        } else {
            console.error('[API Route] Invalid LLM API response structure:', response.data);
            throw new Error('Invalid response structure from LLM API');
        }

    } catch (error: any) {
        // 6. 에러 처리
        console.error('[API Route] Error processing LLM request:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
        let errorMessage = 'Failed to get response from LLM';
        let statusCode = 500;

        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED') {
                errorMessage = 'Connection to the local LLM server was refused. Is it running?';
                statusCode = 503; // Service Unavailable
            } else if (error.code === 'ETIMEDOUT' || error.response?.status === 504) {
                errorMessage = 'Request to the local LLM server timed out.';
                statusCode = 504; // Gateway Timeout
            } else if (error.response) {
                errorMessage = `LLM API responded with status ${error.response.status}`;
                statusCode = 500; // 내부 서버 오류로 처리 (또는 상태 코드 전달)
            }
        }
        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}