// src/app/page.tsx
'use client'; // 클라이언트 컴포넌트임을 명시 (useState, 이벤트 핸들러 사용)

import { useState, FormEvent, useEffect } from 'react';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter()

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setIsLoggedIn(false);
        setPrompt('');
        setResponse('');
        toast.success('로그아웃되었습니다.', {
          duration: 3000,
          position: 'top-center',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('로그아웃 실패:', error);
      toast.error('로그아웃 중 오류가 발생했습니다.', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || isLoading || !isLoggedIn) return;

    setIsLoading(true);
    setResponse('');
    setError(null);

    try {
      const res = await fetch('/api/llm/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3-Korean-Bllossom-8B-Q4_K_M",
          prompt: prompt,
          max_tokens: 256,
          temperature: 0.7,
          priority: 10
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(`${data.message} (대기 시간: ${data.queuePosition}초)`);
          return;
        }
        throw new Error(data.error || `API request failed with status ${res.status}`);
      }

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Next.js LLM Prototype</h1>
          <p>로컬 LLM 모델에게 질문해보세요.</p>
        </div>
        {isLoggedIn ? (
          <Button
            onClick={handleLogout}
            variant="outline"
            style={{
              borderColor: '#dc3545',
              color: '#dc3545'
            }}
            className="hover:bg-red-500 hover:text-white"
          >
            로그아웃
          </Button>
        ) : (
          <Button
            onClick={() => router.push('/auth')}
            variant="outline"
          >
            로그인
          </Button>
        )}
      </div>

      {!isLoggedIn && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '4px',
          color: '#856404'
        }}>
          <p>질문을 하시려면 로그인이 필요합니다.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={isLoggedIn ? "여기에 질문을 입력하세요..." : "로그인이 필요합니다."}
          rows={5}
          style={{
            width: '100%',
            marginBottom: '10px',
            padding: '10px',
            boxSizing: 'border-box',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: isLoggedIn ? 'white' : '#f5f5f5',
            cursor: isLoggedIn ? 'text' : 'not-allowed'
          }}
          disabled={isLoading || !isLoggedIn}
          required
        />
        <button
          type="submit"
          disabled={isLoading || !isLoggedIn}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            cursor: (isLoading || !isLoggedIn) ? 'not-allowed' : 'pointer',
            backgroundColor: (isLoading || !isLoggedIn) ? '#ccc' : '#0070f3',
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