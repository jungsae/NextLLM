'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Calendar, Search } from 'lucide-react';
import { useState } from 'react';

interface ChatHistory {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messageCount: number;
}

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // 임시 데이터 (나중에 실제 API로 교체)
    const [chatHistory] = useState<ChatHistory[]>([
        {
            id: '1',
            title: 'React 컴포넌트 설계에 대해',
            lastMessage: '컴포넌트를 재사용 가능하게 만드는 방법을 알려주세요.',
            timestamp: new Date('2024-01-15T10:30:00'),
            messageCount: 5
        },
        {
            id: '2',
            title: 'TypeScript 타입 정의',
            lastMessage: '인터페이스와 타입의 차이점은 무엇인가요?',
            timestamp: new Date('2024-01-14T15:45:00'),
            messageCount: 3
        },
        {
            id: '3',
            title: 'Next.js 라우팅',
            lastMessage: 'App Router와 Pages Router의 차이점을 설명해주세요.',
            timestamp: new Date('2024-01-13T09:20:00'),
            messageCount: 7
        }
    ]);

    const filteredHistory = chatHistory.filter(chat =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">대화 기록</h2>
                    <p className="text-muted-foreground">
                        이전 대화 내용을 확인하고 관리하세요.
                    </p>
                </div>

                {/* 검색 */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="대화 내용 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>

                {/* 대화 목록 */}
                <div className="space-y-4">
                    {filteredHistory.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">대화 기록이 없습니다</h3>
                                <p className="text-muted-foreground mb-4">
                                    아직 대화 기록이 없습니다. LLM 챗봇에서 대화를 시작해보세요.
                                </p>
                                <Button onClick={() => window.location.href = '/chat'}>
                                    챗봇 시작하기
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredHistory.map((chat) => (
                            <Card key={chat.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2">{chat.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {chat.lastMessage}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{chat.messageCount}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(chat.timestamp)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                보기
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                삭제
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* 통계 */}
                {filteredHistory.length > 0 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>통계</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{filteredHistory.length}</div>
                                    <div className="text-sm text-muted-foreground">총 대화</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {filteredHistory.reduce((sum, chat) => sum + chat.messageCount, 0)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">총 메시지</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {Math.round(filteredHistory.reduce((sum, chat) => sum + chat.messageCount, 0) / filteredHistory.length)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">평균 메시지</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
} 