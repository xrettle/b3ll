'use client';

import React, { useEffect, useState, useRef } from 'react';

interface Snowflake {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    wobbleSpeed: number;
    wobbleOffset: number;
}

interface SnowEffectProps {
    intensity?: number; // 1-10, higher = more snowflakes
    className?: string;
}

export function SnowEffect({ intensity = 5, className = '' }: SnowEffectProps) {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
    const animationRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        // Create initial snowflakes based on intensity
        const count = intensity * 15;
        const initialFlakes: Snowflake[] = [];

        for (let i = 0; i < count; i++) {
            initialFlakes.push(createSnowflake(i));
        }
        setSnowflakes(initialFlakes);

        // Animation loop with FPS limiting (30 FPS for performance)
        const animate = (timestamp: number) => {
            if (timestamp - lastTimeRef.current >= 33) { // ~30 FPS
                lastTimeRef.current = timestamp;

                setSnowflakes(prev => {
                    return prev.map(flake => {
                        let newY = flake.y + flake.speed;
                        let newX = flake.x + Math.sin((flake.y * 0.01) + flake.wobbleOffset) * flake.wobbleSpeed;

                        // Reset if off screen
                        if (newY > window.innerHeight + 10) {
                            return createSnowflake(flake.id, true);
                        }

                        // Wrap horizontally
                        if (newX < -10) newX = window.innerWidth + 10;
                        if (newX > window.innerWidth + 10) newX = -10;

                        return { ...flake, y: newY, x: newX };
                    });
                });
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [intensity]);

    function createSnowflake(id: number, fromTop = false): Snowflake {
        const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const height = typeof window !== 'undefined' ? window.innerHeight : 800;

        return {
            id,
            x: Math.random() * width,
            y: fromTop ? -10 : Math.random() * height,
            size: 2 + Math.random() * 4,
            speed: 0.5 + Math.random() * 1.5,
            opacity: 0.4 + Math.random() * 0.6,
            wobbleSpeed: 0.3 + Math.random() * 0.7,
            wobbleOffset: Math.random() * Math.PI * 2,
        };
    }

    return (
        <div
            className={`fixed inset-0 pointer-events-none z-40 overflow-hidden ${className}`}
            aria-hidden="true"
        >
            {snowflakes.map(flake => (
                <div
                    key={flake.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: flake.x,
                        top: flake.y,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        boxShadow: `0 0 ${flake.size * 2}px rgba(255,255,255,0.5)`,
                    }}
                />
            ))}
        </div>
    );
}

export default SnowEffect;
