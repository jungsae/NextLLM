"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

export function AuthForm() {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        try {
            setIsLoading(true)

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            })

            if (error) {
                throw error
            }

            toast.success(`${provider === 'google' ? 'Google' : 'GitHub'} 로그인 페이지로 이동합니다.`)
        } catch (error) {
            console.error('Error:', error)
            toast.error(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col space-y-4">
            <Button
                variant="outline"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
            >
                {isLoading ? '로그인 중...' : 'Google로 계속하기'}
            </Button>
            <Button
                variant="outline"
                onClick={() => handleOAuthLogin('github')}
                disabled={isLoading}
            >
                {isLoading ? '로그인 중...' : 'GitHub로 계속하기'}
            </Button>
        </div>
    )
} 