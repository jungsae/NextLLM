'use client';

import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">
                        로그인
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        서비스를 이용하기 위해 로그인해주세요.
                    </p>
                </div>
                <AuthForm />
            </div>
        </div>
    );
} 