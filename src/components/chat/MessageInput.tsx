'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
    isConnected?: boolean;
    isConnecting?: boolean;
    disabled?: boolean;
}

export function MessageInput({
    onSendMessage,
    isLoading,
    isConnected,
    isConnecting,
    disabled
}: MessageInputProps) {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!prompt.trim() || isLoading || disabled) return;

        onSendMessage(prompt.trim());
        setPrompt('');
    };

    const getPlaceholder = () => {
        if (disabled) return "연결이 필요합니다";
        if (isConnecting) return "연결 중... 잠시만 기다려주세요.";
        if (!isConnected) return "연결되지 않음 - 재연결 버튼을 클릭하세요.";
        return "질문을 입력하세요...";
    };

    const isSubmitDisabled = isLoading || isConnecting || !prompt.trim() || !isConnected || disabled;

    return (
        <div className="border-t p-2 sm:p-4 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={getPlaceholder()}
                    rows={2}
                    className="flex-1 resize-none rounded-md border border-input bg-background px-2 py-2 sm:px-3 sm:py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading || isConnecting || !isConnected || disabled}
                    required
                />
                <Button
                    type="submit"
                    disabled={isSubmitDisabled}
                    size="icon"
                    className="flex-shrink-0"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
} 