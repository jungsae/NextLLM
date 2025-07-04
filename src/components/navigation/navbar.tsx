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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NavbarProps {
    title?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
}

export function Navbar({ title, showBackButton = true, showHomeButton = true }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoggedIn, user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('로그아웃되었습니다.');
            router.push('/');
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
        <header className="border-b bg-card top-0 left-0 right-0 z-50 w-full">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center py-3 sm:py-4">
                    {/* 왼쪽 영역 - 뒤로가기/홈 버튼 및 제목 */}
                    <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
                        {showBackButton && canGoBack() && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="mr-1 sm:mr-2 flex-shrink-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}

                        {showHomeButton && pathname !== '/' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/')}
                                className="mr-1 sm:mr-2 flex-shrink-0"
                            >
                                <Home className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg sm:text-xl font-bold truncate">{getPageTitle()}</h1>
                                {isLoggedIn && user && (
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 영역 - 테마 토글 및 로그인/로그아웃 */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <ThemeToggle />

                        {isLoggedIn ? (
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                            >
                                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>로그아웃</span>
                            </Button>
                        ) : (
                            <Button
                                onClick={() => router.push('/auth')}
                                variant="outline"
                                size="sm"
                                className="text-xs sm:text-sm px-2 sm:px-3"
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