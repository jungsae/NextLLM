// 커스텀 에러 클래스들
export class ValidationError extends Error {
    public statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

export class AuthenticationError extends Error {
    public statusCode: number;

    constructor(message: string = '인증이 필요합니다.') {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401;
    }
}

export class AuthorizationError extends Error {
    public statusCode: number;

    constructor(message: string = '권한이 없습니다.') {
        super(message);
        this.name = 'AuthorizationError';
        this.statusCode = 403;
    }
}

export class NotFoundError extends Error {
    public statusCode: number;

    constructor(message: string = '리소스를 찾을 수 없습니다.') {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class BusinessError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = 'BusinessError';
        this.statusCode = statusCode;
    }
}

// 에러 응답 생성 헬퍼 함수
export const createErrorResponse = (error: Error) => {
    const statusCode = (error as any).statusCode || 500;
    const message = error.message || '서버 오류가 발생했습니다.';

    return {
        success: false,
        error: message,
        statusCode
    };
};

// 에러 처리 미들웨어
export const handleApiError = (error: unknown) => {
    console.error('API 오류:', error);

    if (error instanceof ValidationError ||
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError ||
        error instanceof BusinessError) {
        return createErrorResponse(error);
    }

    // 알 수 없는 에러
    return {
        success: false,
        error: '서버 오류가 발생했습니다.',
        statusCode: 500
    };
}; 