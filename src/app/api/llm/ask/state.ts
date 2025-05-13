// 서버 상태 관리를 위한 전역 변수들
let isProcessing = false; // 현재 요청 처리 중인지 여부
let lastRequestTime = 0; // 마지막 요청이 시작된 시간 (밀리초)

export const serverState = {
    // 현재 요청 처리 중인지 확인하는 getter
    isProcessing: () => isProcessing,

    // 처리 상태를 설정하고 시작 시간을 기록하는 setter
    setProcessing: (state: boolean) => {
        isProcessing = state;
        if (state) {
            lastRequestTime = Date.now(); // 처리 시작 시 현재 시간 기록
        }
    },

    // 마지막 요청 시작 시간을 반환
    getLastRequestTime: () => lastRequestTime,

    // 현재 요청이 대기열에서 기다린 시간(초)을 계산
    getQueuePosition: () => {
        if (!isProcessing) return 0; // 처리 중이 아니면 대기 시간 없음
        const timeSinceLastRequest = Date.now() - lastRequestTime; // 경과 시간 계산
        return Math.max(0, Math.floor(timeSinceLastRequest / 1000)); // 초 단위로 반환
    }
}; 