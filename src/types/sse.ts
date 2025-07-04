export interface SSEMessage {
    type: 'JOB_UPDATE' | 'JOB_COMPLETED' | 'JOB_FAILED' | 'QUEUE_UPDATE' | 'CONNECTION_ESTABLISHED' | 'heartbeat';
    data: any;
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