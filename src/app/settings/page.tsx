'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    User,
    Bell,
    Shield,
    Palette,
    Database,
    Save,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        notifications: true,
        emailAlerts: false,
        darkMode: true,
        autoSave: true,
        dataCollection: false
    });

    const [userProfile, setUserProfile] = useState({
        name: '사용자',
        email: 'user@example.com',
        language: 'ko',
        timezone: 'Asia/Seoul'
    });

    const handleSettingChange = (key: string, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        toast.success('설정이 저장되었습니다.');
    };

    const handleSaveSettings = () => {
        // 실제로는 API 호출로 설정 저장
        toast.success('모든 설정이 저장되었습니다.');
    };

    const handleDeleteAccount = () => {
        if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            toast.error('계정 삭제 기능은 아직 구현되지 않았습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">설정</h2>
                    <p className="text-muted-foreground">
                        계정 및 시스템 설정을 관리하세요.
                    </p>
                </div>

                {/* 계정 설정 */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            계정 정보
                        </CardTitle>
                        <CardDescription>개인 정보 및 계정 설정</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">이름</label>
                                <input
                                    type="text"
                                    value={userProfile.name}
                                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">이메일</label>
                                <input
                                    type="email"
                                    value={userProfile.email}
                                    disabled
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">언어</label>
                                <select
                                    value={userProfile.language}
                                    onChange={(e) => setUserProfile(prev => ({ ...prev, language: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="ko">한국어</option>
                                    <option value="en">English</option>
                                    <option value="ja">日本語</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">시간대</label>
                                <select
                                    value={userProfile.timezone}
                                    onChange={(e) => setUserProfile(prev => ({ ...prev, timezone: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="Asia/Seoul">서울 (UTC+9)</option>
                                    <option value="America/New_York">뉴욕 (UTC-5)</option>
                                    <option value="Europe/London">런던 (UTC+0)</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 알림 설정 */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            알림 설정
                        </CardTitle>
                        <CardDescription>알림 및 이메일 설정</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">푸시 알림</p>
                                <p className="text-sm text-muted-foreground">새 메시지 및 업데이트 알림</p>
                            </div>
                            <Switch
                                checked={settings.notifications}
                                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">이메일 알림</p>
                                <p className="text-sm text-muted-foreground">주요 업데이트를 이메일로 받기</p>
                            </div>
                            <Switch
                                checked={settings.emailAlerts}
                                onCheckedChange={(checked) => handleSettingChange('emailAlerts', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 외관 설정 */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            외관 설정
                        </CardTitle>
                        <CardDescription>테마 및 디스플레이 설정</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">다크 모드</p>
                                <p className="text-sm text-muted-foreground">어두운 테마 사용</p>
                            </div>
                            <Switch
                                checked={settings.darkMode}
                                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">자동 저장</p>
                                <p className="text-sm text-muted-foreground">대화 내용 자동 저장</p>
                            </div>
                            <Switch
                                checked={settings.autoSave}
                                onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 개인정보 보호 */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            개인정보 보호
                        </CardTitle>
                        <CardDescription>데이터 수집 및 개인정보 설정</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">사용 통계 수집</p>
                                <p className="text-sm text-muted-foreground">서비스 개선을 위한 익명 통계 수집</p>
                            </div>
                            <Switch
                                checked={settings.dataCollection}
                                onCheckedChange={(checked) => handleSettingChange('dataCollection', checked)}
                            />
                        </div>
                        <div className="pt-4 border-t">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                데이터 내보내기
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 액션 버튼 */}
                <div className="flex justify-between items-center">
                    <Button
                        onClick={handleDeleteAccount}
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        계정 삭제
                    </Button>

                    <Button
                        onClick={handleSaveSettings}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        설정 저장
                    </Button>
                </div>
            </main>
        </div>
    );
} 