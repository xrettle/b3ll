'use client';

import React from 'react';

interface LiquidGlassProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
    borderRadius?: string;
}

// Simplified LiquidGlass component using CSS filters for a glass-like effect
export function LiquidGlass({
    children,
    className = '',
    intensity = 1,
    borderRadius = '1rem'
}: LiquidGlassProps) {
    const glassStyles: React.CSSProperties = {
        position: 'relative',
        backdropFilter: `blur(${8 * intensity}px) saturate(${1.2 + 0.3 * intensity}) brightness(${1.05 + 0.1 * intensity})`,
        WebkitBackdropFilter: `blur(${8 * intensity}px) saturate(${1.2 + 0.3 * intensity}) brightness(${1.05 + 0.1 * intensity})`,
        background: `linear-gradient(
      135deg,
      rgba(255, 255, 255, ${0.1 * intensity}) 0%,
      rgba(255, 255, 255, ${0.05 * intensity}) 50%,
      rgba(255, 255, 255, ${0.02 * intensity}) 100%
    )`,
        boxShadow: `
      0 8px 32px rgba(0, 0, 0, ${0.15 * intensity}),
      inset 0 1px 0 rgba(255, 255, 255, ${0.2 * intensity}),
      inset 0 -1px 0 rgba(0, 0, 0, ${0.1 * intensity})
    `,
        border: `1px solid rgba(255, 255, 255, ${0.15 * intensity})`,
        borderRadius,
        overflow: 'hidden',
    };

    return (
        <div style={glassStyles} className={className}>
            {/* Highlight effect */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: `linear-gradient(
            to bottom,
            rgba(255, 255, 255, ${0.15 * intensity}),
            rgba(255, 255, 255, 0)
          )`,
                    pointerEvents: 'none',
                    borderRadius: `${borderRadius} ${borderRadius} 50% 50%`,
                }}
            />
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
}

export default LiquidGlass;
