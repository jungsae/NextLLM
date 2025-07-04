'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AuthState {
    isLoggedIn: boolean;
    user: any;
    loading: boolean;
    login: (user: any) => void;
    logout: () => void;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<{ isLoggedIn: boolean; user: any; loading: boolean }>({
        isLoggedIn: false,
        user: null,
        loading: true,
    });

    // 인증 상태 새로고침 함수
    const refreshAuth = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include', // 쿠키 포함
            });

            if (response.ok) {
                const data = await response.json();

                // 사용자 정보가 유효하지 않은 경우 자동 로그아웃
                if (!data.isLoggedIn && data.message?.includes('사용자 정보가 유효하지 않습니다')) {
                    console.log('사용자 정보가 유효하지 않습니다. 자동 로그아웃 처리합니다.');
                    // 쿠키 정리
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                    });
                }

                setAuth({
                    isLoggedIn: data.isLoggedIn,
                    user: data.user,
                    loading: false
                });
            } else {
                // 인증 실패 시 로그아웃 상태로 설정
                setAuth({ isLoggedIn: false, user: null, loading: false });
            }
        } catch (error) {
            console.error('인증 상태 확인 실패:', error);
            setAuth({ isLoggedIn: false, user: null, loading: false });
        }
    }, []);

    // 로그인 함수
    const login = useCallback((user: any) => {
        setAuth({ isLoggedIn: true, user, loading: false });
    }, []);

    // 로그아웃 함수
    const logout = useCallback(async () => {
        try {
            // 로그아웃 API 호출
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // 쿠키 포함
            });

            if (!response.ok) {
                console.error('로그아웃 API 호출 실패:', response.status);
            }
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
        } finally {
            // 상태 즉시 초기화
            setAuth({ isLoggedIn: false, user: null, loading: false });
        }
    }, []);

    // 초기 인증 상태 확인
    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    // 주기적 인증 상태 확인 (5분마다)
    useEffect(() => {
        if (!auth.isLoggedIn) return;

        const interval = setInterval(() => {
            refreshAuth();
        }, 5 * 60 * 1000); // 5분

        return () => clearInterval(interval);
    }, [auth.isLoggedIn, refreshAuth]);

    // 페이지 포커스 시 인증 상태 재확인
    useEffect(() => {
        const handleFocus = () => {
            if (auth.isLoggedIn) {
                refreshAuth();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [auth.isLoggedIn, refreshAuth]);

    return (
        <AuthContext.Provider value={{ ...auth, login, logout, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
} 