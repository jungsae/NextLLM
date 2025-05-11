// 서버 상태 관리를 위한 전역 변수
let isProcessing = false;
let lastRequestTime = 0;

export const serverState = {
    isProcessing: () => isProcessing,
    setProcessing: (state: boolean) => {
        isProcessing = state;
        if (state) {
            lastRequestTime = Date.now();
        }
    },
    getLastRequestTime: () => lastRequestTime,
    getQueuePosition: () => {
        if (!isProcessing) return 0;
        const timeSinceLastRequest = Date.now() - lastRequestTime;
        return Math.max(0, Math.floor(timeSinceLastRequest / 1000)); // 초 단위로 반환
    }
}; 