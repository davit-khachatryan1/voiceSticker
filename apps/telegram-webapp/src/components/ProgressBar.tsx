'use client';

interface ProgressBarProps {
  progress: number; // 0-100
  status: string;
  error?: string;
}

export function ProgressBar({ progress, status, error }: ProgressBarProps) {
  if (error) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '0.5rem' }}>❌ {error}</div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Status: {status}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{status}</span>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{progress}%</span>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

