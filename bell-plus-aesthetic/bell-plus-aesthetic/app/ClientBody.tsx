"use client";

import { useState, useEffect } from "react";

export default function ClientBody({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    // Check if light theme is active
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light-theme');
      setIsLightTheme(isLight);
    };

    // Set up mounted state
    setMounted(true);
    checkTheme();

    // Apply a specific class to the body to prevent flash of content
    if (document.body) {
      document.body.classList.add("content-loaded");
    }

    // Set up theme change detection
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Simulate loading delay for smoother transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      if (document.body) {
        document.body.classList.remove("content-loaded");
      }
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  if (!mounted) {
    return null; // Return nothing during server rendering
  }

  if (loading) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center ${isLightTheme ? 'bg-[#f0f2f5]' : 'bg-[#151718]'} z-50`}>
        <div className="flex space-x-2">
          <div className={`w-3 h-3 rounded-full ${isLightTheme ? 'bg-[#333]' : 'bg-white'} animate-bounce`}></div>
          <div className={`w-3 h-3 rounded-full ${isLightTheme ? 'bg-[#333]' : 'bg-white'} animate-bounce200`}></div>
          <div className={`w-3 h-3 rounded-full ${isLightTheme ? 'bg-[#333]' : 'bg-white'} animate-bounce300`}></div>
        </div>
        <p className={`mt-4 text-lg font-mono ${isLightTheme ? 'text-[#333]' : 'text-white'}`} style={{ fontFamily: '"Fira Code", monospace' }}>
          Loading b3ll...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
