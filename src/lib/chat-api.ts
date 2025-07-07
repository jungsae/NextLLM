import {
    ChatSession,
    ChatStartResponse,
    ChatSendResponse
} from '@/types/job';

const API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_LLM_API_URL;

/**
 * 새 대화 시작
 */
export const startNewChat = async (content: string, userId: string): Promise<ChatStartResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ content, userId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return response.json();
};

/**
 * 기존 대화에 메시지 전송
 */
export const sendMessage = async (content: string, userId: string, sessionId: string): Promise<ChatSendResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ content, userId, sessionId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return response.json();
};

/**
 * 사용자의 대화 세션 목록 조회
 */
export const fetchUserSessions = async (userId: string, limit: number = 10): Promise<ChatSession[]> => {
    const url = `${API_BASE_URL}/api/chat/user/${userId}?limit=${limit}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Network error while fetching sessions:', error);
        throw error;
    }
};

/**
 * 특정 대화 세션 조회 (전체 메시지)
 */
export const fetchSession = async (sessionId: string, userId: string): Promise<ChatSession> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return response.json();
};

/**
 * 새 대화 세션 생성
 */
export const createSession = async (userId: string, title: string): Promise<ChatSession> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ userId, title }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return response.json();
};

/**
 * 대화 세션 삭제
 */
export const deleteSession = async (sessionId: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
}; 