"use client";

import { useState, useEffect } from "react";

export default function ClientBody({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Apply a specific class to the body to prevent flash of content
    if (document.body) {
      document.body.classList.add("content-loaded");
    }

    return () => {
      if (document.body) {
        document.body.classList.remove("content-loaded");
      }
    };
  }, []);

  if (!mounted) {
    return null; // Return nothing during server rendering
  }

  return <>{children}</>;
}
