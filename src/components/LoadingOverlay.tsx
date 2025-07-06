'use client';

import { Loader2, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
    message?: string;
    isVisible?: boolean;
    type?: 'default' | 'auth' | 'chat';
}

export function LoadingOverlay({
    message,
    isVisible = true,
    type = 'default'
}: LoadingOverlayProps) {
    if (!isVisible) return null;

    const getMessage = () => {
        if (message) return message;
        switch (type) {
            case 'auth':
                return '로그인 처리 중...';
            case 'chat':
                return 'AI가 답변을 생성하고 있습니다...';
            default:
                return '로딩 중...';
        }
    };

    return (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-card border rounded-xl p-8 shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-white/80" />
                </div>
                <div className="text-center">
                    <p className="text-base font-semibold text-foreground mb-1">{getMessage()}</p>
                    <div className="flex gap-1 justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingOverlay; 