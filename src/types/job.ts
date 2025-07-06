export interface Job {
    id: number;
    userId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    priority: number;
    inputData: {
        prompt: string;
        // LLM 파라미터는 백엔드에서 관리
    };
    resultData?: {
        id: string;
        model: string;
        created: number;
        content: string;
        finish_reason: string;
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
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
    content: string;
    createdAt: string;
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