import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase';
import { AuthenticationError } from '@/lib/errors';

// SSE 연결을 위한 헤더 설정
const SSE_HEADERS = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // 사용자 인증 확인
        const { user, error: authError } = await getAuthenticatedUser(request as any);

        if (authError || !user) {
            throw new AuthenticationError('인증이 필요합니다.');
        }

        const { userId } = await params;

        // 인증된 사용자와 요청된 userId가 일치하는지 확인
        if (user.id !== userId) {
            return new NextResponse('Unauthorized', { status: 403 });
        }

        // 백엔드 서버로 SSE 연결 프록시
        const backendUrl = process.env.NEXT_PUBLIC_LOCAL_LLM_API_URL;
        const backendSseUrl = `${backendUrl}/api/sse/${userId}`;

        // 인증 헤더 준비
        const authHeaders: Record<string, string> = {
            'Accept': 'text/event-stream',
            'ngrok-skip-browser-warning': 'true', // ngrok 경고 페이지 우회
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

        // 사용자 ID를 헤더로도 전달 (백엔드에서 필요할 수 있음)
        authHeaders['X-User-ID'] = userId;

        // 백엔드 SSE 스트림을 프론트엔드로 전달
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const response = await fetch(backendSseUrl, {
                        method: 'GET',
                        headers: authHeaders,
                    });

                    if (!response.ok) {
                        throw new Error(`Backend SSE connection failed: ${response.status}`);
                    }

                    const reader = response.body?.getReader();
                    if (!reader) {
                        throw new Error('Backend SSE stream not available');
                    }

                    // 백엔드 스트림을 프론트엔드로 전달
                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            controller.close();
                            break;
                        }

                        // 스트림이 닫혀있지 않은 경우에만 데이터 전송
                        try {
                            controller.enqueue(value);
                        } catch (error) {
                            if (error instanceof TypeError && error.message.includes('Controller is already closed')) {
                                break;
                            } else {
                                throw error;
                            }
                        }
                    }
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new NextResponse(stream, {
            headers: SSE_HEADERS,
        });

    } catch {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 