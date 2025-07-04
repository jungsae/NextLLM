"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export function AuthForm() {
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [isGithubLoading, setIsGithubLoading] = useState(false)
    const { refreshAuth } = useAuth()
    const router = useRouter()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 로그인 상태 확인 및 처리
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    // 로그인된 상태면 전역 상태 업데이트
                    await refreshAuth()
                    router.push('/')
                }
            } catch (error) {
                console.error('인증 상태 확인 실패:', error)
            }
        }

        checkAuthStatus()

        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    await refreshAuth()
                    router.push('/')
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase.auth, refreshAuth, router])

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