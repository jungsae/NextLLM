import React from 'react';

export default function ToastProgressBar({ duration = 1000 }: { duration?: number }) {
    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: 5,
                width: '100%',
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                borderRadius: '0 0 var(--radius) var(--radius)',
                boxShadow: '0 1.5px 6px 0 rgba(80,80,180,0.10)',
                opacity: 0.85,
                transformOrigin: 'left',
                animation: `toast-progress-bar ${duration}ms linear forwards`
            }}
        >
            <style jsx>{`
                @keyframes toast-progress-bar {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
} 