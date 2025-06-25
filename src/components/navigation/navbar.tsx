'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    ArrowLeft,
    Home,
    Sparkles,
    LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface NavbarProps {
    title?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
}

export function Navbar({ title, showBackButton = true, showHomeButton = true }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const res = await fetch('/api/auth/check');
                const data = await res.json();
                setIsLoggedIn(data.isLoggedIn);

                if (data.isLoggedIn && data.user) {
                    setUserEmail(data.user.email || '사용자');
                }
            } catch (error) {
                console.error('로그인 상태 확인 실패:', error);
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
            });
            const data = await res.json();

            if (data.success) {
                setIsLoggedIn(false);
                setUserEmail('');
                toast.success('로그아웃되었습니다.');
                router.push('/');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('로그아웃 실패:', error);
            toast.error('로그아웃 중 오류가 발생했습니다.');
        }
    };

    const getPageTitle = () => {
        if (title) return title;

        switch (pathname) {
            case '/':
                return 'LLM 대시보드';
            case '/chat':
                return 'LLM 챗봇';
            case '/products':
                return '상품 보기';
            case '/analytics':
                return '통계 분석';
            case '/settings':
                return '설정';
            case '/auth':
                return '로그인';
            default:
                return 'LLM App';
        }
    };

    const canGoBack = () => {
        return pathname !== '/' && pathname !== '/auth';
    };

    return (
        <header className="border-b bg-card sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* 왼쪽 영역 - 뒤로가기/홈 버튼 및 제목 */}
                    <div className="flex items-center gap-3">
                        {showBackButton && canGoBack() && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="mr-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}

                        {showHomeButton && pathname !== '/' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/')}
                                className="mr-2"
                            >
                                <Home className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">{getPageTitle()}</h1>
                                {isLoggedIn && (
                                    <p className="text-sm text-muted-foreground">
                                        {userEmail}님 환영합니다
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 영역 - 테마 토글 및 로그인/로그아웃 */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {isLoggedIn ? (
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                로그아웃
                            </Button>
                        ) : (
                            <Button
                                onClick={() => router.push('/auth')}
                                size="sm"
                            >
                                로그인
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
} 