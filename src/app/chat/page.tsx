'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Wifi, WifiOff } from "lucide-react";
import { Navbar } from '@/components/navigation/navbar';
import { useSSE } from '@/hooks/useSSE';
import { Job } from '@/types/job';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    jobId?: number;
}

export default function ChatPage() {
    const { isLoggedIn, user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
    const lastProcessedMessageRef = useRef<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { isConnected, isConnecting, lastMessage, error: sseError, manualReconnect } = useSSE(user?.id || '');

    // 자동 스크롤 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 메시지가 추가될 때마다 자동 스크롤
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // SSE 메시지 처리
    useEffect(() => {
        if (lastMessage && currentJob && lastMessage.data.jobId === currentJob.id) {
            // 메시지 중복 방지를 위한 고유 키 생성
            const messageKey = `${lastMessage.type}_${lastMessage.data.jobId}_${lastMessage.data.status}`;

            // 이미 처리된 메시지인지 확인
            if (lastProcessedMessageRef.current === messageKey) {
                return;
            }

            // 메시지 키 저장
            lastProcessedMessageRef.current = messageKey;

            switch (lastMessage.type) {
                case 'JOB_COMPLETED':
                    console.log('작업 완료!', lastMessage.data.result);
                    const assistantMessage: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: lastMessage.data.result.content || lastMessage.data.result,
                        timestamp: new Date(),
                        jobId: currentJob.id
                    };
                    setMessages(prev => [...prev, assistantMessage]);
                    setCurrentJob(null);
                    setIsLoading(false);
                    setError(null);
                    // 메시지 키 초기화
                    lastProcessedMessageRef.current = '';
                    break;

                case 'JOB_FAILED':
                    console.error('작업 실패!', lastMessage.data.error);
                    setError(lastMessage.data.error || '작업 처리 중 오류가 발생했습니다.');
                    setCurrentJob(null);
                    setIsLoading(false);
                    // 메시지 키 초기화
                    lastProcessedMessageRef.current = '';
                    break;

                case 'JOB_UPDATE':
                    // 상태가 실제로 변경된 경우에만 업데이트
                    if (currentJob && currentJob.status !== lastMessage.data.status) {
                        console.log('작업 상태 변경:', lastMessage.data.status);
                        setCurrentJob(prev => prev ? { ...prev, status: lastMessage.data.status } : null);
                    } else {
                        // 상태가 동일한 경우 디버그 레벨로만 로그
                        console.debug('동일한 상태 업데이트 무시:', lastMessage.data.status);
                    }
                    break;
            }
        }
    }, [lastMessage, currentJob]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!prompt.trim() || isLoading || !isLoggedIn || isConnecting || !isConnected) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: prompt,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setPrompt('');
        setIsLoading(true);
        setError(null);

        try {
            // Next.js API 라우트를 통해 Job 생성 요청 (인증 포함)
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: userMessage.content }],
                    priority: 3
                }),
            });

            const data = await res.json();
            console.log("작업 생성 응답:", data);

            if (!res.ok) {
                throw new Error(data.error || `API request failed with status ${res.status}`);
            }

            if (data.success && data.data) {
                setCurrentJob({
                    id: data.data.id,
                    userId: data.data.userId,
                    status: data.data.status,
                    priority: 3,
                    inputData: { prompt: userMessage.content },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                // 사용자 메시지에 jobId 추가
                setMessages(prev => prev.map(msg =>
                    msg.id === userMessage.id ? { ...msg, jobId: data.data.id } : msg
                ));
            } else {
                throw new Error('작업 생성에 실패했습니다.');
            }

        } catch (err: any) {
            console.error("작업 생성 실패:", err);
            setError(err.message || '작업 생성 중 오류가 발생했습니다.');
            setIsLoading(false);
            toast.error('작업 생성 중 오류가 발생했습니다.');
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (authLoading) {
        return <div>로그인 확인 중...</div>;
    }
    if (!isLoggedIn) {
        router.push('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Toaster richColors closeButton />

            <Navbar />

            {/* SSE 연결 상태 표시 */}
            <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                    {isConnected ? (
                        <>
                            <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span className="text-green-600">실시간 연결됨 (SSE)</span>
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
                            <Button
                                onClick={manualReconnect}
                                size="sm"
                                variant="outline"
                                className="h-5 sm:h-6 px-1 sm:px-2 text-xs"
                            >
                                재연결
                            </Button>
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
            <div className="max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-6 h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                <Card className="h-full flex flex-col">
                    <CardHeader className="border-b flex-shrink-0 p-3 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                            대화 시작
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                        {/* 메시지 영역 */}
                        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground py-6 sm:py-8">
                                    <Bot className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                                    <p className="text-sm sm:text-base">첫 번째 질문을 해보세요!</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[75%] sm:max-w-[70%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 break-words ${message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{message.content}</p>
                                            <p className={`text-xs mt-1 ${message.role === 'user'
                                                ? 'text-primary-foreground/70'
                                                : 'text-muted-foreground'
                                                }`}>
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>

                                        {message.role === 'user' && (
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            {isLoading && (
                                <div className="flex gap-2 sm:gap-3 justify-start">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                            <span className="text-xs sm:text-sm text-muted-foreground">
                                                {currentJob?.status === 'PROCESSING' ? 'AI가 답변을 생성하고 있습니다...' : '작업이 대기열에 등록되었습니다...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 자동 스크롤을 위한 타겟 */}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 입력 폼 */}
                        <div className="border-t p-2 sm:p-4 flex-shrink-0">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={
                                        isConnecting ? "연결 중... 잠시만 기다려주세요." :
                                            !isConnected ? "연결되지 않음 - 재연결 버튼을 클릭하세요." :
                                                "질문을 입력하세요..."
                                    }
                                    rows={2}
                                    className="flex-1 resize-none rounded-md border border-input bg-background px-2 py-2 sm:px-3 sm:py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isLoading || isConnecting || !isConnected}
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || isConnecting || !prompt.trim() || !isConnected}
                                    size="icon"
                                    className="flex-shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
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
        </div>
    );
} 