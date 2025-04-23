import React from 'react';

// Declare module for Next.js
declare module 'next' {
  export type Metadata = {
    title?: string;
    description?: string;
    icons?: {
      icon?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

// Declare module for Next.js font
declare module 'next/font/google' {
  export function Inter(options: { subsets: string[] }): {
    className: string;
    style: React.CSSProperties;
  };

  export function Fira_Code(options: { 
    subsets: string[];
    weight: string[];
    variable: string;
  }): {
    className: string;
    style: React.CSSProperties;
    variable: string;
  };
}

// Declare module for ClientBody
declare module './ClientBody' {
  export default function ClientBody({ children }: { children: React.ReactNode }): JSX.Element;
}
