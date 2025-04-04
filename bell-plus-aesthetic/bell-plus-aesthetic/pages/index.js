// This file exists to satisfy Netlify's requirement for a pages directory
// The actual app is in the app directory

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the app directory
    router.push('/');
  }, [router]);
  
  return null;
}
