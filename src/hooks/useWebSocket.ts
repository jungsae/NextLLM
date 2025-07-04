import { useEffect, useRef, useState } from 'react';
import { getWebSocketUrl } from '@/lib/utils';

interface WebSocketMessage {
    type: 'JOB_UPDATE' | 'JOB_COMPLETED' | 'JOB_FAILED' | 'QUEUE_UPDATE' | 'CONNECTION_ESTABLISHED';
    data: any;
}

export const useWebSocket = (userId: string) => {
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [isMaxAttemptsReached, setIsMaxAttemptsReached] = useState(false);
    const maxReconnectAttempts = 5;

    const connect = () => {
        if (!userId || isMaxAttemptsReached) {
            console.log('연결 중단: userId 없음 또는 최대 시도 횟수 초과');
            return;
        }

        try {
            // 기존 연결이 있다면 정리
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }

            // 기존 재연결 타이머가 있다면 정리
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            // 연결 시작
            setIsConnecting(true);

            // 환경별 WebSocket URL 사용
            const wsUrl = getWebSocketUrl(userId);
            console.log('WebSocket 연결 시도:', wsUrl, `(${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('WebSocket 연결 성공:', wsUrl);
                setIsConnected(true);
                setIsConnecting(false);
                reconnectAttemptsRef.current = 0;
                setReconnectAttempts(0);
                setIsMaxAttemptsReached(false);
            };

            ws.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setLastMessage(message);

                    console.log('WebSocket 메시지 수신:', message);
                } catch (error) {
                    console.error('WebSocket 메시지 파싱 실패:', error);
                }
            };

            ws.current.onclose = (event) => {
                console.log('WebSocket 연결 해제:', event.code, event.reason);
                setIsConnected(false);
                setIsConnecting(false);

                // 자동 재연결 시도 (최대 횟수 제한)
                if (reconnectAttemptsRef.current < maxReconnectAttempts - 1) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000); // 지수 백오프
                    console.log(`${delay}ms 후 재연결 시도 (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current += 1;
                        setReconnectAttempts(reconnectAttemptsRef.current);
                        connect();
                    }, delay);
                } else {
                    console.log('최대 재연결 시도 횟수 초과. 연결을 중단합니다.');
                    setIsMaxAttemptsReached(true);
                    setReconnectAttempts(maxReconnectAttempts);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket 에러:', error);
                setIsConnected(false);
                setIsConnecting(false);
            };
        } catch (error) {
            console.error('WebSocket 연결 실패:', error);
            setIsConnected(false);
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        // 초기화
        reconnectAttemptsRef.current = 0;
        setReconnectAttempts(0);
        setIsMaxAttemptsReached(false);
        setIsConnecting(false);

        // 초기 연결
        connect();

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };
    }, [userId]);

    // 수동 재연결 함수
    const manualReconnect = () => {
        if (isMaxAttemptsReached) {
            console.log('수동 재연결 시작');
            reconnectAttemptsRef.current = 0;
            setReconnectAttempts(0);
            setIsMaxAttemptsReached(false);
            connect();
        }
    };

    return {
        isConnected,
        isConnecting,
        lastMessage,
        reconnectAttempts,
        maxReconnectAttempts,
        isMaxAttemptsReached,
        manualReconnect
    };
};