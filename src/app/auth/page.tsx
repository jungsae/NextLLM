'use client';

import { AuthForm } from "@/components/auth/auth-form"
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="relative flex items-center mb-2 min-h-[48px]">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="absolute left-0 top-1/2 -translate-y-1/2"
                        aria-label="뒤로가기"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="w-full text-center text-3xl font-bold tracking-tight">
                        로그인
                    </h2>
                </div>
                <p className="mt-2 text-sm text-gray-600 text-center">
                    서비스를 이용하기 위해 로그인해주세요.
                </p>
                <AuthForm />
            </div>
        </div>
    );
} 