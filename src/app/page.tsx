// src/app/page.tsx
'use client'; // 클라이언트 컴포넌트임을 명시 (useState, 이벤트 핸들러 사용)

import { useState, FormEvent, useEffect } from 'react';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useSearchParams, useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"

export default function HomePage() {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'login_success') {
      // 토스트 메시지가 이미 표시되었는지 확인
      const hasShownToast = sessionStorage.getItem('hasShownLoginToast')
      if (!hasShownToast) {
        toast.success('로그인에 성공했습니다!', {
          duration: 3000,
          position: 'top-center',
        })
        sessionStorage.setItem('hasShownLoginToast', 'true')
        // URL에서 message 파라미터 제거
        router.replace('/')
      }
    }
  }, [router, searchParams]) // 의존성 배열을 비워서 컴포넌트 마운트 시 한 번만 실행

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
        body: JSON.stringify({
          model: "llama-3-Korean-Bllossom-8B-Q4_K_M",
          prompt: prompt,
          max_tokens: 256,
          temperature: 0.7,
          priority: 10
        }),
      });

      console.log("res", res);

      const data = await res.json(); // 응답 본문을 JSON으로 파싱

      console.log("data", data);

      if (!res.ok) {
        // 서버가 바쁜 경우
        if (res.status === 429) {
          setError(`${data.message} (대기 시간: ${data.queuePosition}초)`);
          return;
        }
        // 기타 에러
        throw new Error(data.error || `API request failed with status ${res.status}`);
      }

      // 성공 응답 처리
      if (data.choices && data.choices.length > 0) {
        setResponse(data.choices[0].message.content);
      } else {
        throw new Error('Invalid response format from LLM API');
      }

    } catch (err: any) {
      console.error("API call failed:", err);
      setError(err.message || 'Failed to fetch response from the API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif', position: 'relative' }}>
      <Toaster richColors closeButton />
      {isLoading && <LoadingOverlay />}

      <h1>Next.js LLM Prototype</h1>
      <p>로컬 LLM 모델에게 질문해보세요.</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="여기에 질문을 입력하세요..."
          rows={5}
          style={{
            width: '100%',
            marginBottom: '10px',
            padding: '10px',
            boxSizing: 'border-box',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            backgroundColor: isLoading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
        >
          {isLoading ? '요청 중...' : '전송'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: '20px',
          color: 'red',
          border: '1px solid red',
          padding: '10px',
          whiteSpace: 'pre-wrap',
          borderRadius: '4px',
          backgroundColor: '#fff5f5',
        }}>
          <p><strong>오류 발생:</strong> {error}</p>
        </div>
      )}

      {response && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          color: '#000000',
        }}>
          <h3>응답:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}