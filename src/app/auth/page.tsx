import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">로그인</h1>
                    <p className="text-muted-foreground mt-2">
                        계정에 로그인하여 계속하세요
                    </p>
                </div>
                <AuthForm />
            </div>
        </div>
    )
} 