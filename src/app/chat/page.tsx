'use client';

import { useState, FormEvent, useEffect } from 'react';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { Navbar } from '@/components/navigation/navbar';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatPage() {
    const [prompt, setPrompt] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        // 로그인 상태 확인
        const checkLoginStatus = async () => {
            try {
                const res = await fetch('/api/auth/check');
                const data = await res.json();
                setIsLoggedIn(data.isLoggedIn);

                if (!data.isLoggedIn) {
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!prompt.trim() || isLoading || !isLoggedIn) return;

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
            const res = await fetch('/api/llm/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama-3-Korean-Bllossom-8B-Q4_K_M",
                    prompt: userMessage.content,
                    max_tokens: 256,
                    temperature: 0.7,
                    priority: 10
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    throw new Error(`${data.message} (대기 시간: ${data.queuePosition}초)`);
                }
                throw new Error(data.error || `API request failed with status ${res.status}`);
            }

            if (data.choices && data.choices.length > 0) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.choices[0].message.content,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error('Invalid response format from LLM API');
            }

        } catch (err: any) {
            console.error("API call failed:", err);
            setError(err.message || 'Failed to fetch response from the API.');
            toast.error('질문 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
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
            {isLoading && <LoadingOverlay />}

            <Navbar />

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
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                                    placeholder="질문을 입력하세요..."
                                    rows={2}
                                    className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isLoading}
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || !prompt.trim()}
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