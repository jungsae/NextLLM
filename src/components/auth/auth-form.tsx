"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function AuthForm() {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGithubLogin = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col space-y-4">
            <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
            >
                Google로 계속하기
            </Button>
            <Button
                variant="outline"
                onClick={handleGithubLogin}
                disabled={isLoading}
            >
                GitHub로 계속하기
            </Button>
        </div>
    )
} 