"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function AuthForm() {
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [isGithubLoading, setIsGithubLoading] = useState(false)
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) {
                throw error
            }
        } catch (error) {
            console.error('로그인 중 오류 발생:', error)
            toast.error("Google 로그인 중 오류가 발생했습니다.")
        } finally {
            setIsGoogleLoading(false)
        }
    }

    const handleGithubLogin = async () => {
        try {
            setIsGithubLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) {
                throw error
            }
        } catch (error) {
            console.error('로그인 중 오류 발생:', error)
            toast.error("GitHub 로그인 중 오류가 발생했습니다.")
        } finally {
            setIsGithubLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isGithubLoading}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
            >
                {isGoogleLoading ? '로그인 중...' : 'Google로 로그인'}
            </Button>
            <Button
                onClick={handleGithubLogin}
                disabled={isGoogleLoading || isGithubLoading}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
            >
                {isGithubLoading ? '로그인 중...' : 'GitHub로 로그인'}
            </Button>
        </div>
    )
} 