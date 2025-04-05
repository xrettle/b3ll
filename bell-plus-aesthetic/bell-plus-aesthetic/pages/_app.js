// This file exists to ensure Next.js recognizes the pages directory
// The actual app is using the app directory structure in src/app

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function App() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main app
    router.replace('/');
  }, []);
  
  return null;
}
