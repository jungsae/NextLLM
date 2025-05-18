'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';

export default function TestPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h1 className="text-4xl font-bold mb-4">UI 컴포넌트 테스트</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    설치된 UI 라이브러리들의 기능을 테스트합니다.
                </p>
            </motion.div>

            <div className="flex flex-col gap-4">
                <Button>기본 버튼</Button>
                <Button variant="secondary" onClick={() => console.log('보조 버튼 클릭')}>보조 버튼</Button>
                <Button variant="destructive" onClick={() => console.log('삭제 버튼 클릭')}>삭제 버튼</Button>
                <Button variant="outline" onClick={() => console.log('아웃라인 버튼 클릭')}>아웃라인 버튼</Button>
                <Button variant="ghost" onClick={() => console.log('고스트 버튼 클릭')}>고스트 버튼</Button>
                <Button variant="link" onClick={() => console.log('링크 버튼 클릭')}>링크 버튼</Button>
            </div>
        </div>
    );
} 