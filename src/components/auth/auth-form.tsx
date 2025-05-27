"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function AuthForm() {
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [isGithubLoading, setIsGithubLoading] = useState(false)
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";
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
                    redirectTo: `${window.location.origin}${redirectUrl}`,
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
                    redirectTo: `${window.location.origin}${redirectUrl}`,
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
                <svg width="20" height="20" viewBox="0 0 48 48">
                    <g>
                        <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z" />
                        <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.2 29.5 4 24 4c-7.2 0-13.4 3.1-17.7 8.1z" />
                        <path fill="#FBBC05" d="M24 44c5.1 0 9.7-1.7 13.3-4.7l-6.2-5.1C29.5 36.9 26.9 38 24 38c-6.1 0-11.3-4.1-13.1-9.6l-7 5.4C7.1 41.1 14.9 44 24 44z" />
                        <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.1 5.5-7.7 5.5-4.6 0-8.4-3.8-8.4-8.5s3.8-8.5 8.4-8.5c2.3 0 4.3.8 5.8 2.1l6.1-6.1C34.5 6.2 29.5 4 24 4c-7.2 0-13.4 3.1-17.7 8.1z" />
                    </g>
                </svg>
                {isGoogleLoading ? '로그인 중...' : 'Google로 로그인'}
            </Button>
            <Button
                onClick={handleGithubLogin}
                disabled={isGoogleLoading || isGithubLoading}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.8-1.1.8-1.1-.8-.1-1.6-.4-1.6-1.7 0-.4.1-.7.3-.9-.3-.1-.7-.4-.7-1.1 0-.2.1-.4.2-.6-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2 0-.3.1-.5.2-.7-.2-.1-.7-.3-.7-1.2z" />
                </svg>
                {isGithubLoading ? '로그인 중...' : 'GitHub로 로그인'}
            </Button>
        </div>
    )
} 