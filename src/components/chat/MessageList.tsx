'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/types/job';

interface MessageListProps {
    messages: ChatMessage[];
    isLoading?: boolean;
    currentJobStatus?: string;
}

export function MessageList({ messages, isLoading, currentJobStatus }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 자동 스크롤 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 메시지가 추가될 때마다 자동 스크롤
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 메시지 시간 포맷
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
            {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 sm:py-8">
                    <Bot className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">첫 번째 질문을 해보세요!</p>
                </div>
            ) : (
                messages.map((message, index) => {
                    // 첫 번째 메시지는 사용자, 두 번째는 AI, 세 번째는 사용자... 순서로 번갈아가며 표시
                    const isUserMessage = index % 2 === 0;

                    return (
                        <div
                            key={message.id}
                            className={`flex gap-2 sm:gap-3 ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isUserMessage && (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                                </div>
                            )}

                            <div
                                className={`max-w-[75%] sm:max-w-[70%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 break-words ${isUserMessage
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
                                    {message.content}
                                </p>
                                <p className={`text-xs mt-1 ${isUserMessage
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground'
                                    }`}>
                                    {formatTime(message.createdAt)}
                                </p>
                            </div>

                            {isUserMessage && (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                    );
                })
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
                                {currentJobStatus === 'PROCESSING' ? 'AI가 답변을 생성하고 있습니다...' : '작업이 대기열에 등록되었습니다...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 자동 스크롤을 위한 타겟 */}
            <div ref={messagesEndRef} />
        </div>
    );
} 