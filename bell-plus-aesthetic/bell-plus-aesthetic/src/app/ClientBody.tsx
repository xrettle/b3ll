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
        <div dangerouslySetInnerHTML={{
          __html: `
            <lord-icon
              src="https://cdn.lordicon.com/jpgpblwn.json"
              trigger="loop"
              colors="${isLightTheme ? 'primary:#121331,secondary:#08a88a' : 'primary:#ffffff,secondary:#08a88a'}"
              style="width: 250px; height: 250px;">
            </lord-icon>
          `
        }} />
        <p className={`mt-4 text-lg font-mono ${isLightTheme ? 'text-[#333]' : 'text-white'}`} style={{ fontFamily: '"Fira Code", monospace' }}>
          Loading Bell Timer...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
