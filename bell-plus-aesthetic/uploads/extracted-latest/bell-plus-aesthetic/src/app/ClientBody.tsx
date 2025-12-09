"use client";

import * as React from "react";
import { useState, useEffect } from "react";

// Fallback loading component
const LoadingFallback = ({ isLightTheme }: { isLightTheme: boolean }) => (
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

export default function ClientBody({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [hasError, setHasError] = useState(false);

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

    // Check for any URL parameters that might indicate debug mode
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('debug');
    if (debugMode) {
      console.log('Debug mode enabled:', debugMode);
      // Still allow the app to load even in debug mode
    }

    // Simulate loading delay for smoother transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Add error handling for uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
      // Don't prevent default - let the ErrorBoundary handle it
    };

    window.addEventListener('error', handleError);

    return () => {
      if (document.body) {
        document.body.classList.remove("content-loaded");
      }
      observer.disconnect();
      clearTimeout(timer);
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (!mounted) {
    return null; // Return nothing during server rendering
  }

  if (loading) {
    return <LoadingFallback isLightTheme={isLightTheme} />;
  }

  // Return the children directly with fallback for loading state
  return mounted ? (
    <>{children}</>
  ) : (
    <LoadingFallback isLightTheme={isLightTheme} />
  );
}
