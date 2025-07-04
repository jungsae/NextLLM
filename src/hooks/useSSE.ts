import { useEffect, useRef, useState } from 'react';

interface SSEMessage {
    type: 'JOB_UPDATE' | 'JOB_COMPLETED' | 'JOB_FAILED' | 'QUEUE_UPDATE' | 'CONNECTION_ESTABLISHED' | 'heartbeat';
    data: any;
}

export const useSSE = (userId: string) => {
    const eventSource = useRef<EventSource | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId || userId.trim() === '') {
            console.log('SSE 연결 중단: userId 없음');
            setIsConnected(false);
            setIsConnecting(false);
            return;
        }

        // 기존 연결이 있다면 정리
        if (eventSource.current) {
            eventSource.current.close();
            eventSource.current = null;
        }

        // 연결 시작
        setIsConnecting(true);
        setError(null);

        try {
            // Next.js API 라우트를 통해 SSE 연결 (인증 포함)
            const protocol = window.location.protocol;
            const host = window.location.host;
            const sseUrl = `${protocol}//${host}/api/sse/${userId}`;

            console.log('SSE 연결 시도 (Next.js 프록시):', sseUrl);
            eventSource.current = new EventSource(sseUrl);

            eventSource.current.onopen = () => {
                console.log('SSE 연결 성공:', sseUrl);
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
            };

            eventSource.current.onmessage = (event) => {
                try {
                    const message: SSEMessage = JSON.parse(event.data);

                    // heartbeat는 무시
                    if (message.type === 'heartbeat') {
                        console.log('SSE heartbeat 수신');
                        return;
                    }

                    setLastMessage(message);
                    console.log('SSE 메시지 수신:', message);
                } catch (error) {
                    console.error('SSE 메시지 파싱 실패:', error);
                }
            };

            eventSource.current.onerror = (error) => {
                console.error('SSE 에러:', error);
                setIsConnected(false);
                setIsConnecting(false);

                // 인증 관련 에러인 경우 재연결 시도
                if (error instanceof Event && error.target) {
                    const target = error.target as EventSource;
                    if (target.readyState === EventSource.CLOSED) {
                        console.log('SSE 연결이 닫혔습니다. 재연결을 시도합니다.');
                        // 3초 후 재연결 시도
                        setTimeout(() => {
                            if (eventSource.current) {
                                eventSource.current.close();
                                eventSource.current = null;
                            }
                            manualReconnect();
                        }, 3000);
                    }
                }

                setError('SSE 연결에 실패했습니다.');
            };
        } catch (error) {
            console.error('SSE 연결 실패:', error);
            setIsConnected(false);
            setIsConnecting(false);
            setError('SSE 연결을 초기화할 수 없습니다.');
        }

        // 컴포넌트 언마운트 시 연결 해제
        return () => {
            if (eventSource.current) {
                console.log('SSE 연결 해제');
                eventSource.current.close();
                eventSource.current = null;
            }
            setIsConnected(false);
            setIsConnecting(false);
        };
    }, [userId]);

    // 수동 재연결 함수
    const manualReconnect = () => {
        if (eventSource.current) {
            eventSource.current.close();
            eventSource.current = null;
        }
        setIsConnected(false);
        setIsConnecting(false);
        setError(null);

        // 강제로 재연결을 위해 useEffect 의존성 변경
        setTimeout(() => {
            if (eventSource.current) {
                eventSource.current.close();
                eventSource.current = null;
            }
        }, 100);
    };

    return {
        isConnected,
        isConnecting,
        lastMessage,
        error,
        manualReconnect
    };
}; 