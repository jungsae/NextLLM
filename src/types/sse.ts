export interface SSEMessage {
    type: 'JOB_UPDATE' | 'JOB_COMPLETED' | 'JOB_FAILED' | 'QUEUE_UPDATE' | 'CONNECTION_ESTABLISHED' | 'heartbeat';
    data: JobUpdateData | JobCompletedData | JobFailedData | QueueUpdateData | ConnectionData | any;
}

export interface JobUpdateData {
    jobId: string | number;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    userId?: string;
    progress?: number;
}

export interface JobCompletedData {
    jobId: string | number;
    userId?: string;
    result: {
        content?: string;
        id?: string;
        model?: string;
        created?: number;
        finish_reason?: string;
        usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    } | string; // 백엔드에서 문자열로 보낼 수도 있음
}

export interface JobFailedData {
    jobId: string | number;
    userId?: string;
    error: string;
    status?: 'FAILED';
}

export interface QueueUpdateData {
    queueLength: number;
    position?: number;
    estimatedWaitTime?: number;
    userId?: string;
}

export interface ConnectionData {
    userId?: string;
    message?: string;
}

export interface Job {
    id: number;
    userId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    priority: number;
    inputData: {
        prompt: string;
        max_tokens?: number;
        temperature?: number;
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

export interface QueueUpdate {
    queueLength: number;
    position: number;
    estimatedWaitTime: number;
} 