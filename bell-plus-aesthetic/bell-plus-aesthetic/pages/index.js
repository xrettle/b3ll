import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Import the app from src directory
    const { pathname } = window.location;
    if (pathname === '/') {
      import('../src/app/page').catch(console.error);
    }
  }, [router]);
  
  // Render a simple loading state
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#333', animation: 'bounce 1s infinite' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#333', animation: 'bounce 1s infinite 0.2s' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#333', animation: 'bounce 1s infinite 0.4s' }}></div>
        </div>
        <p>Loading b3ll...</p>
      </div>
    </div>
  );
}
