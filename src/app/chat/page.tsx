'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Wifi, WifiOff } from "lucide-react";
import { Navbar } from '@/components/navigation/navbar';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Job } from '@/types/job';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    jobId?: number;
}

export default function ChatPage() {
    const [prompt, setPrompt] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [currentJob, setCurrentJob] = useState<Job | null>(null);
    const [userId, setUserId] = useState<string>('');
    const router = useRouter();

    // WebSocket 연결
    const { isConnected, isConnecting, lastMessage, reconnectAttempts, maxReconnectAttempts, isMaxAttemptsReached, manualReconnect } = useWebSocket(userId);

    useEffect(() => {
        // 로그인 상태 확인
        const checkLoginStatus = async () => {
            try {
                const res = await fetch('/api/auth/check');

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setIsLoggedIn(data.isLoggedIn);

                if (data.isLoggedIn && data.user) {
                    setUserId(data.user.id);
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('로그인 상태 확인 실패:', error);
                setIsLoggedIn(false);
                router.push('/');
            }
        };

        checkLoginStatus();
    }, [router]);

    // WebSocket 메시지 처리
    useEffect(() => {
        if (lastMessage && currentJob) {
            if (lastMessage.data.jobId === currentJob.id) {
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
                        break;

                    case 'JOB_FAILED':
                        console.error('작업 실패!', lastMessage.data.error);
                        setError(lastMessage.data.error || '작업 처리 중 오류가 발생했습니다.');
                        setCurrentJob(null);
                        setIsLoading(false);
                        break;

                    case 'JOB_UPDATE':
                        console.log('작업 상태 변경:', lastMessage.data.status);
                        setCurrentJob(prev => prev ? { ...prev, status: lastMessage.data.status } : null);
                        break;
                }
            }
        }
    }, [lastMessage, currentJob]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!prompt.trim() || isLoading || !isLoggedIn || isConnecting || !isConnected || isMaxAttemptsReached) return;

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
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user',
                            content: userMessage.content
                        }
                    ],
                    user_id: userId,
                    priority: 3,
                    max_tokens: 256,
                    temperature: 0.7
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

    if (!isLoggedIn) {
        return <div>로그인 확인 중...</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Toaster richColors closeButton />

            <Navbar />

            {/* WebSocket 연결 상태 표시 */}
            <div className="max-w-4xl mx-auto px-4 py-2">
                <div className="flex items-center gap-2 text-sm">
                    {isConnected ? (
                        <>
                            <Wifi className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">실시간 연결됨</span>
                        </>
                    ) : isConnecting ? (
                        <>
                            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-blue-600">연결 중...</span>
                        </>
                    ) : isMaxAttemptsReached ? (
                        <div className="flex items-center gap-2">
                            <WifiOff className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">연결 실패 - 최대 시도 횟수 초과</span>
                            <Button
                                onClick={manualReconnect}
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                            >
                                재연결
                            </Button>
                        </div>
                    ) : (
                        <>
                            <WifiOff className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">
                                재연결 시도 중... ({reconnectAttempts}/{maxReconnectAttempts})
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* 채팅 영역 */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <Card className="h-[600px] flex flex-col">
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            대화 시작
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-0">
                        {/* 메시지 영역 */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>첫 번째 질문을 해보세요!</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[70%] rounded-lg px-4 py-2 ${message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                            <p className={`text-xs mt-1 ${message.role === 'user'
                                                ? 'text-primary-foreground/70'
                                                : 'text-muted-foreground'
                                                }`}>
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>

                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <User className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {currentJob?.status === 'PROCESSING' ? 'AI가 답변을 생성하고 있습니다...' : '작업이 대기열에 등록되었습니다...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 입력 폼 */}
                        <div className="border-t p-4">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={
                                        isConnecting ? "연결 중... 잠시만 기다려주세요." :
                                            !isConnected && !isMaxAttemptsReached ? "재연결 시도 중... 잠시만 기다려주세요." :
                                                isMaxAttemptsReached ? "연결 실패 - 재연결 버튼을 클릭하세요." :
                                                    "질문을 입력하세요..."
                                    }
                                    rows={2}
                                    className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isLoading || isConnecting || !isConnected || isMaxAttemptsReached}
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || isConnecting || !prompt.trim() || !isConnected || isMaxAttemptsReached}
                                    size="icon"
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