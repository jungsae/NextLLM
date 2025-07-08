'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, MessageSquare, Clock, Users, Activity, Cpu, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTokenUsageStats, fetchModelUsageStats } from '@/lib/chat-api';
import { TokenUsageStats, ModelUsageStats } from '@/types/job';

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [tokenStats, setTokenStats] = useState<TokenUsageStats[]>([]);
    const [modelStats, setModelStats] = useState<ModelUsageStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 임시 데이터 (나중에 실제 API로 교체)
    const stats = {
        totalChats: 24,
        totalMessages: 156,
        averageResponseTime: 2.3,
        activeUsers: 3,
        weeklyGrowth: 12.5,
        monthlyGrowth: 8.2
    };

    const weeklyData = [
        { day: '월', chats: 4, messages: 23 },
        { day: '화', chats: 6, messages: 34 },
        { day: '수', chats: 3, messages: 18 },
        { day: '목', chats: 8, messages: 45 },
        { day: '금', chats: 5, messages: 28 },
        { day: '토', chats: 2, messages: 12 },
        { day: '일', chats: 1, messages: 8 }
    ];

    const topTopics = [
        { topic: 'React 개발', count: 8, percentage: 33.3 },
        { topic: 'TypeScript', count: 6, percentage: 25.0 },
        { topic: 'Next.js', count: 4, percentage: 16.7 },
        { topic: 'UI/UX 디자인', count: 3, percentage: 12.5 },
        { topic: '데이터베이스', count: 3, percentage: 12.5 }
    ];

    // 토큰 사용량 통계 로드
    useEffect(() => {
        const loadStats = async () => {
            if (!user?.id) return;

            try {
                setIsLoading(true);
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const [tokenData, modelData] = await Promise.all([
                    fetchTokenUsageStats(user.id, startDate, endDate),
                    fetchModelUsageStats(startDate, endDate)
                ]);

                setTokenStats(tokenData);
                setModelStats(modelData);
            } catch (error) {
                console.error('통계 로드 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, [user?.id]);

    // 토큰 사용량 계산
    const totalTokens = tokenStats.reduce((sum, stat) => sum + stat.totalTokens, 0);
    const totalPromptTokens = tokenStats.reduce((sum, stat) => sum + stat.promptTokens, 0);
    const totalCompletionTokens = tokenStats.reduce((sum, stat) => sum + stat.completionTokens, 0);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 pt-[56px] sm:pt-0 pb-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">통계 분석</h2>
                    <p className="text-muted-foreground">
                        사용 통계와 분석 결과를 확인하세요.
                    </p>
                </div>

                {/* 주요 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">총 대화</p>
                                    <p className="text-2xl font-bold">{stats.totalChats}</p>
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        +{stats.weeklyGrowth}%
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                    <MessageSquare className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">총 메시지</p>
                                    <p className="text-2xl font-bold">{stats.totalMessages}</p>
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        +{stats.monthlyGrowth}%
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                    <BarChart3 className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">평균 응답 시간</p>
                                    <p className="text-2xl font-bold">{stats.averageResponseTime}초</p>
                                    <p className="text-xs text-blue-600 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        빠름
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                    <Clock className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">활성 사용자</p>
                                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                                    <p className="text-xs text-orange-600 flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        이번 주
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                                    <Users className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 토큰 사용량 통계 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                토큰 사용량 (최근 30일)
                            </CardTitle>
                            <CardDescription>LLM 모델별 토큰 사용량 통계</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="text-sm text-muted-foreground mt-2">통계 로딩 중...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600">
                                                {totalTokens.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">총 토큰</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">
                                                {totalPromptTokens.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">프롬프트</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-purple-600">
                                                {totalCompletionTokens.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">완성</div>
                                        </div>
                                    </div>

                                    {tokenStats.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">최근 사용 내역</h4>
                                            {tokenStats.slice(0, 5).map((stat, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Cpu className="h-3 w-3 text-muted-foreground" />
                                                        <span className="truncate max-w-32">{stat.model}</span>
                                                    </div>
                                                    <span className="text-muted-foreground">
                                                        {stat.totalTokens.toLocaleString()} 토큰
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cpu className="h-5 w-5" />
                                모델별 사용량
                            </CardTitle>
                            <CardDescription>각 LLM 모델의 사용 빈도 및 토큰 소모량</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="text-sm text-muted-foreground mt-2">통계 로딩 중...</p>
                                </div>
                            ) : modelStats.length > 0 ? (
                                <div className="space-y-4">
                                    {modelStats.map((stat, index) => (
                                        <div key={stat.model} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                                    </div>
                                                    <span className="text-sm font-medium truncate max-w-32">{stat.model}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {stat._count.model}회 사용
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>총 토큰</span>
                                                    <span>{stat._sum.totalTokens.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${(stat._sum.totalTokens / Math.max(...modelStats.map(s => s._sum.totalTokens))) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>프롬프트: {stat._sum.promptTokens.toLocaleString()}</span>
                                                    <span>완성: {stat._sum.completionTokens.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">사용 데이터가 없습니다.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 주간 활동 차트 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                주간 활동
                            </CardTitle>
                            <CardDescription>이번 주 대화 및 메시지 활동</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {weeklyData.map((day) => (
                                    <div key={day.day} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{day.day}</span>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(day.chats / 8) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-muted-foreground w-8">{day.chats}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${(day.messages / 45) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-muted-foreground w-8">{day.messages}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                                    <span>대화</span>
                                    <span>메시지</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                인기 주제
                            </CardTitle>
                            <CardDescription>가장 많이 논의된 주제들</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topTopics.map((topic, index) => (
                                    <div key={topic.topic} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                                <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                            </div>
                                            <span className="text-sm font-medium">{topic.topic}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${topic.percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-muted-foreground w-8">{topic.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 성능 지표 */}
                <Card>
                    <CardHeader>
                        <CardTitle>성능 지표</CardTitle>
                        <CardDescription>시스템 성능 및 사용자 경험 지표</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">99.8%</div>
                                <div className="text-sm text-muted-foreground">가동률</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">2.3초</div>
                                <div className="text-sm text-muted-foreground">평균 응답 시간</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">4.8/5.0</div>
                                <div className="text-sm text-muted-foreground">사용자 만족도</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
} 