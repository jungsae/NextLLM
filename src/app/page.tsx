// src/app/page.tsx
'use client'; // 클라이언트 컴포넌트임을 명시 (useState, 이벤트 핸들러 사용)

import { useState, FormEvent } from 'react';

export default function HomePage() {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setResponse('');
    setError(null);

    try {
      // Next.js API 라우트 호출 (프론트엔드 -> 백엔드(Next.js))
      const res = await fetch('/api/llm/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 나중에 인증 구현 시 여기에 JWT 토큰 추가
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      const data = await res.json(); // 응답 본문을 JSON으로 파싱

      if (!res.ok) {
        // API 라우트에서 에러 응답을 보낸 경우
        throw new Error(data.error || `API request failed with status ${res.status}`);
      }

      // 성공 응답 처리
      setResponse(data.response);

    } catch (err: any) {
      console.error("API call failed:", err);
      setError(err.message || 'Failed to fetch response from the API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Next.js LLM Prototype</h1>
      <p>로컬 LLM 모델에게 질문해보세요.</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="여기에 질문을 입력하세요..."
          rows={5}
          style={{ width: '100%', marginBottom: '10px', padding: '10px', boxSizing: 'border-box', fontSize: '1rem' }}
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: '10px 20px', fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? '요청 중...' : '전송'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '20px', color: 'red', border: '1px solid red', padding: '10px', whiteSpace: 'pre-wrap' }}>
          <p><strong>오류 발생:</strong> {error}</p>
        </div>
      )}

      {response && (
        <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap', border: '1px solid #eee', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
          <h2>모델 응답:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}