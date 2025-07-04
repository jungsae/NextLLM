'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, MessageSquare, Clock, Users, Activity } from 'lucide-react';

export default function AnalyticsPage() {
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