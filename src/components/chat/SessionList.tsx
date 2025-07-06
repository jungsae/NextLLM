'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare, Plus } from 'lucide-react';
import { ChatSession } from '@/types/job';
import { fetchUserSessions, deleteSession } from '@/lib/chat-api';
import { toast } from 'sonner';

interface SessionListProps {
    userId: string;
    currentSessionId?: string;
    onSessionSelect: (session: ChatSession) => void;
    onNewChat: () => void;
    onSessionDelete: (sessionId: string) => void;
}

export function SessionList({
    userId,
    currentSessionId,
    onSessionSelect,
    onNewChat,
    onSessionDelete
}: SessionListProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 세션 목록 로드
    const loadSessions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchUserSessions(userId, 20);
            setSessions(data);
        } catch (error: any) {
            setError(error.message);
            toast.error('세션 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 세션 삭제
    const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        if (!confirm('이 대화를 삭제하시겠습니까?')) {
            return;
        }

        try {
            await deleteSession(sessionId, userId);
            setSessions(prev => prev.filter(session => session.id !== sessionId));
            onSessionDelete(sessionId);
            toast.success('대화가 삭제되었습니다.');
        } catch {
            toast.error('대화 삭제에 실패했습니다.');
        }
    };

    // 세션 제목 생성 (첫 번째 메시지 또는 기본값)
    const getSessionTitle = (session: ChatSession) => {
        if (session.title && session.title !== '새로운 대화') {
            return session.title;
        }

        const firstMessage = session.messages[0];
        if (firstMessage) {
            return firstMessage.content.length > 30
                ? firstMessage.content.substring(0, 30) + '...'
                : firstMessage.content;
        }

        return '새로운 대화';
    };

    // 세션 마지막 메시지 시간 포맷
    const formatLastMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return '방금 전';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}시간 전`;
        } else {
            return date.toLocaleDateString('ko-KR');
        }
    };

    useEffect(() => {
        loadSessions();
    }, [userId]);

    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">대화 목록</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="animate-pulse space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-muted rounded-lg"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">대화 목록</CardTitle>
                    <Button
                        onClick={onNewChat}
                        size="sm"
                        variant="outline"
                        className="h-8 px-3"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        새 대화
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-2">
                {error && (
                    <div className="text-sm text-destructive p-2 bg-destructive/10 rounded">
                        {error}
                    </div>
                )}

                {sessions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">대화가 없습니다</h3>
                        <p className="text-sm mb-6">새로운 대화를 시작해보세요!</p>
                        <Button
                            onClick={onNewChat}
                            size="lg"
                            className="px-6"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            첫 대화 시작하기
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => onSessionSelect(session)}
                                className={`p-4 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 border ${currentSessionId === session.id ? 'bg-muted border-primary' : 'border-border'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                            <p className="text-base font-medium truncate">
                                                {getSessionTitle(session)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                {session.messages.length}개 메시지
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatLastMessageTime(session.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={(e) => handleDeleteSession(session.id, e)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 