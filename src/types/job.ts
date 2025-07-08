export interface Job {
    id: number;
    userId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    priority: number;
    inputData: {
        prompt: string;
        // LLM 파라미터는 백엔드에서 관리
    };
    // resultData 제거 - llmResponse로 대체
    llmResponse?: LLMResponse;
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
}

// 새로운 LLM Response 타입
export interface LLMResponse {
    id: string;
    llmResponseId: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    finishReason: string;
    createdAt?: string;
    job?: Job;
    messages?: ChatMessage[];
}

// LLM Response 통계 타입
export interface TokenUsageStats {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model: string;
    createdAt: string;
}

export interface ModelUsageStats {
    model: string;
    _count: {
        model: number;
    };
    _sum: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface WebSocketMessage {
    type: 'JOB_UPDATE' | 'JOB_COMPLETED' | 'JOB_FAILED' | 'QUEUE_UPDATE' | 'CONNECTION_ESTABLISHED';
    data: any;
}

export interface JobCreateRequest {
    messages: Array<{
        content: string;
    }>;
    priority: number;
    // max_tokens와 temperature는 백엔드에서 안전한 기본값으로 관리
}

export interface JobResponse {
    id: number;
    status: string;
    message: string;
}

// 새로운 Chat API 타입들
export interface ChatMessage {
    id: number;
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    llmResponseId?: string;
    reasoningContent?: string | null;
    toolCalls?: any | null;
    llmResponse?: LLMResponse;
}

export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: ChatMessage[];
}

export interface ChatStartRequest {
    content: string;
    userId: string;
}

export interface ChatSendRequest {
    content: string;
    userId: string;
    sessionId: string;
}

export interface ChatStartResponse {
    sessionId: string;
    jobId: number;
    userMessage: ChatMessage;
    status: string;
}

export interface ChatSendResponse {
    sessionId: string;
    jobId: number;
    userMessage: ChatMessage;
    status: string;
} 