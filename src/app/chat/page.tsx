'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, WifiOff, Bot } from "lucide-react";
import { Navbar } from '@/components/navigation/navbar';
import { useSSE } from '@/hooks/useSSE';
import { Job, ChatSession, ChatMessage } from '@/types/job';
import { useAuth } from '@/contexts/AuthContext';
import { SessionList } from '@/components/chat/SessionList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { startNewChat, sendMessage, fetchSession } from '@/lib/chat-api';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function ChatPage() {
    const { isLoggedIn, user, loading: authLoading, loadingType } = useAuth();
    const router = useRouter();

    // 상태 관리
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
    const lastProcessedMessageRef = useRef<string>('');

    // SSE 연결
    const { isConnected, isConnecting, lastMessage, error: sseError, manualReconnect } = useSSE(user?.id || '');

    // SSE 메시지 처리
    useEffect(() => {
        if (!lastMessage) return;

        // 메시지 중복 방지를 위한 고유 키 생성
        const messageKey = `${lastMessage.type}_${lastMessage.data?.jobId || 'unknown'}_${lastMessage.data?.status || 'unknown'}`;

        // 이미 처리된 메시지인지 확인
        if (lastProcessedMessageRef.current === messageKey) {
            return;
        }

        // 메시지 키 저장
        lastProcessedMessageRef.current = messageKey;

        // jobId 비교 헬퍼 함수
        const isJobMatch = (messageJobId: any, currentJobId: any) => {
            if (!messageJobId || !currentJobId) return false;
            return messageJobId.toString() === currentJobId.toString();
        };

        switch (lastMessage.type) {
            case 'JOB_COMPLETED':
                // 현재 작업과 관련된 메시지인지 확인
                if (currentJob && isJobMatch(lastMessage.data?.jobId, currentJob.id)) {
                    // 결과 내용 추출
                    let content = '응답을 생성할 수 없습니다.';
                    if (typeof lastMessage.data.result === 'string') {
                        content = lastMessage.data.result;
                    } else if (lastMessage.data.result?.content) {
                        content = lastMessage.data.result.content;
                    }

                    const assistantMessage: ChatMessage = {
                        id: Date.now(),
                        sessionId: currentSession?.id || '',
                        role: 'assistant',
                        content: content,
                        createdAt: new Date().toISOString()
                    };

                    setMessages(prev => [...prev, assistantMessage]);
                    setCurrentJob(null);
                    setIsLoading(false);
                    setError(null);
                    lastProcessedMessageRef.current = '';
                }
                break;

            case 'JOB_FAILED':
                // 현재 작업과 관련된 메시지인지 확인
                if (currentJob && isJobMatch(lastMessage.data?.jobId, currentJob.id)) {
                    setError(lastMessage.data.error || '작업 처리 중 오류가 발생했습니다.');
                    setCurrentJob(null);
                    setIsLoading(false);
                    lastProcessedMessageRef.current = '';
                }
                break;

            case 'JOB_UPDATE':
                // 현재 작업과 관련된 메시지인지 확인
                if (currentJob && isJobMatch(lastMessage.data?.jobId, currentJob.id)) {
                    // 상태가 실제로 변경된 경우에만 업데이트
                    if (currentJob.status !== lastMessage.data.status) {
                        setCurrentJob(prev => prev ? { ...prev, status: lastMessage.data.status } : null);
                    }
                }
                break;

            case 'QUEUE_UPDATE':
                // 큐 상태 업데이트는 현재 작업과 무관하게 처리 가능
                break;

            case 'CONNECTION_ESTABLISHED':
                // SSE 연결 확립
                break;

            default:
                // 처리되지 않은 메시지 타입
                break;
        }
    }, [lastMessage, currentJob, currentSession]);

    // 인증 확인
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push('/');
        }
    }, [isLoggedIn, authLoading, router]);

    // 새 대화 시작
    const handleStartNewChat = () => {
        // 임시 세션 생성 (실제로는 첫 메시지를 보낼 때 생성됨)
        const tempSession: ChatSession = {
            id: 'temp-' + Date.now(),
            userId: user?.id || '',
            title: '새 대화',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: []
        };
        setCurrentSession(tempSession);
        setMessages([]);
        setError(null);
        setCurrentJob(null);
    };

    // 세션 선택
    const handleSessionSelect = async (session: ChatSession) => {
        if (!user?.id) {
            toast.error('사용자 정보를 찾을 수 없습니다.');
            return;
        }

        try {
            setIsLoading(true);
            // 전체 세션 정보와 메시지를 가져오기
            const fullSession = await fetchSession(session.id, user.id);
            setCurrentSession(fullSession);
            setMessages(fullSession.messages);
            setError(null);
            setCurrentJob(null);
        } catch (error: any) {
            console.error('세션 로드 실패:', error);
            toast.error('세션을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 세션 삭제
    const handleSessionDelete = (sessionId: string) => {
        if (currentSession?.id === sessionId) {
            setCurrentSession(null);
            setMessages([]);
        }
        // 임시 세션인 경우 목록으로 돌아가기
        if (sessionId.startsWith('temp-')) {
            setCurrentSession(null);
            setMessages([]);
        }
    };

    // 메시지 전송
    const handleSendMessage = async (content: string) => {
        if (!user?.id) {
            toast.error('사용자 정보를 찾을 수 없습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let response;

            if (currentSession && !currentSession.id.startsWith('temp-')) {
                // 기존 대화에 메시지 전송
                response = await sendMessage(content, user.id, currentSession.id);
            } else {
                // 새 대화 시작
                response = await startNewChat(content, user.id);

                // 새 세션 정보 설정
                const newSession: ChatSession = {
                    id: response.sessionId,
                    userId: user.id,
                    title: content.length > 30 ? content.substring(0, 30) + '...' : content,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    messages: [response.userMessage]
                };
                setCurrentSession(newSession);
            }

            // 사용자 메시지에 role 추가
            const userMessageWithRole = {
                ...response.userMessage,
                role: 'user' as const
            };
            setMessages(prev => [...prev, userMessageWithRole]);

            // 현재 작업 설정
            setCurrentJob({
                id: response.jobId,
                userId: user.id,
                status: response.status as any,
                priority: 3,
                inputData: { prompt: content },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

        } catch (error: any) {
            console.error("메시지 전송 실패:", error);
            setError(error.message || '메시지 전송 중 오류가 발생했습니다.');
            setIsLoading(false);
            toast.error('메시지 전송 중 오류가 발생했습니다.');
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">로그인 확인 중...</p>
                </div>
            </div>
        );
    }
    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Toaster
                richColors
                closeButton
                duration={3000}
                position="top-center"
                expand={true}
                swipeDirections={["right"]}
            />

            <LoadingOverlay isVisible={authLoading} type={loadingType || 'auth'} />

            <Navbar />

            {/* SSE 연결 상태 표시 */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-[5px] sm:pt-0 pb-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                    {isConnected ? (
                        <>
                            <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span className="text-green-600">Live</span>
                        </>
                    ) : isConnecting ? (
                        <>
                            <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-blue-600">연결 중...</span>
                        </>
                    ) : sseError ? (
                        <div className="flex items-center gap-2">
                            <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                            <span className="text-red-600">연결 실패</span>
                            <button
                                onClick={manualReconnect}
                                className="text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                            >
                                재연결
                            </button>
                        </div>
                    ) : (
                        <>
                            <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                            <span className="text-red-600">연결되지 않음</span>
                        </>
                    )}
                </div>
            </div>

            {/* 채팅 영역 */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-[5px] sm:pt-0 pb-3 sm:pb-6 h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                {currentSession ? (
                    // 대화창이 선택된 경우
                    <div className="h-full">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="border-b flex-shrink-0 p-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {currentSession.title}
                                    </CardTitle>
                                    <button
                                        onClick={() => {
                                            setCurrentSession(null);
                                            setMessages([]);
                                            setError(null);
                                            setCurrentJob(null);
                                        }}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        ← 목록으로
                                    </button>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                                {/* 메시지 목록 */}
                                <MessageList
                                    messages={messages}
                                    isLoading={isLoading}
                                    currentJobStatus={currentJob?.status}
                                />

                                {/* 메시지 입력 */}
                                <MessageInput
                                    onSendMessage={handleSendMessage}
                                    isLoading={isLoading}
                                    isConnected={isConnected}
                                    isConnecting={isConnecting}
                                    disabled={!isLoggedIn}
                                />
                            </CardContent>
                        </Card>

                        {error && (
                            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-destructive text-sm">
                                    <strong>오류 발생:</strong> {error}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    // 세션 목록만 보이는 경우
                    <div className="h-full">
                        <SessionList
                            userId={user?.id || ''}
                            currentSessionId={undefined}
                            onSessionSelect={handleSessionSelect}
                            onNewChat={handleStartNewChat}
                            onSessionDelete={handleSessionDelete}
                        />
                    </div>
                )}
            </div>
        </div>
    );
} 