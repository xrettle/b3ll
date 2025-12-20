'use client';

import React, { useEffect, useRef, useState } from 'react';

// Preset configurations from DIA Ouroborus
export const ouroborusPresets = {
    woodGrain: {
        name: 'Wood Grain',
        perlinscale: 1.5,
        dIntensity: 0.003,
        mix: 0.12,
        scaleFactor: 0.4,
        expandFactor: 0.0,
        caIntensity: 0.0,
        flicker: true,
        frequency: 1.0,
        contrast1: 1.0,
        contrast2: 0.0,
        noiseType: 0,
        perlinspeed: 0.25,
    },
    chroma: {
        name: 'Chroma',
        perlinscale: 3.0,
        dIntensity: 0.0015,
        mix: 0.15,
        scaleFactor: 0.2,
        expandFactor: 0.0,
        caIntensity: 0.002,
        flicker: false,
        frequency: 1.0,
        contrast1: 1.0,
        contrast2: 0.0,
        noiseType: 3,
        perlinspeed: 0.2,
    },
    inkBleed: {
        name: 'Ink Bleed',
        perlinscale: 4.5,
        dIntensity: 0.003,
        mix: 0.1,
        scaleFactor: 0.0,
        expandFactor: 1.5,
        caIntensity: 0.0,
        flicker: false,
        frequency: 1.0,
        contrast1: 1.0,
        contrast2: 0.0,
        noiseType: 2,
        perlinspeed: 0.2,
    },
    opArt: {
        name: 'Op Art',
        perlinscale: 1.0,
        dIntensity: 0.003,
        mix: 0.08,
        scaleFactor: 0.5,
        expandFactor: 0.0,
        caIntensity: 0.0,
        flicker: true,
        frequency: 10.0,
        contrast1: 0.2,
        contrast2: 0.01,
        noiseType: 4,
        perlinspeed: 0.25,
    },
    oldTv: {
        name: 'Old TV',
        perlinscale: 6.0,
        dIntensity: 0.0044,
        mix: 0.15,
        scaleFactor: 0.28,
        expandFactor: 0.0,
        caIntensity: 0.003,
        flicker: true,
        frequency: 1.0,
        contrast1: 1.0,
        contrast2: 0.0,
        noiseType: 3,
        perlinspeed: 0.15,
    },
    fragments: {
        name: 'Fragments',
        perlinscale: 6.0,
        dIntensity: 0.007,
        mix: 0.2,
        scaleFactor: 0.43,
        expandFactor: 5.0,
        caIntensity: 0.005,
        flicker: true,
        frequency: 1.0,
        contrast1: 0.0,
        contrast2: 0.43,
        noiseType: 4,
        perlinspeed: 0.1,
    },
};

export type OuroborusPresetKey = keyof typeof ouroborusPresets | 'random';

interface OuroborusEffectProps {
    preset?: OuroborusPresetKey;
    className?: string;
}

// Canvas-based text distortion effect inspired by DIA Ouroborus
export function OuroborusEffect({ preset = 'woodGrain', className = '' }: OuroborusEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);
    const animationRef = useRef<number>();

    // Get current preset config
    const getPresetConfig = () => {
        if (preset === 'random') {
            const keys = Object.keys(ouroborusPresets) as (keyof typeof ouroborusPresets)[];
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            return ouroborusPresets[randomKey];
        }
        return ouroborusPresets[preset] || ouroborusPresets.woodGrain;
    };

    useEffect(() => {
        setMounted(true);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!mounted || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const config = getPresetConfig();
        let time = 0;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const dpr = Math.min(window.devicePixelRatio, 1); // Cap at 1x for performance
                canvas.width = parent.offsetWidth * dpr;
                canvas.height = parent.offsetHeight * dpr;
                ctx.scale(dpr, dpr);
            }
        };

        resize();
        window.addEventListener('resize', resize);

        // Improved noise function
        const noise = (x: number, y: number, seed: number) => {
            const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
            return n - Math.floor(n);
        };

        // FPS limiting for performance
        let lastFrameTime = 0;
        const targetFPS = 20; // Lower FPS for this overlay effect
        const frameInterval = 1000 / targetFPS;

        const animate = (timestamp: number) => {
            // FPS limiting
            if (timestamp - lastFrameTime < frameInterval) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }
            lastFrameTime = timestamp;

            time += 0.016 * config.perlinspeed * 2;

            const parent = canvas.parentElement;
            if (!parent) return;

            const width = parent.offsetWidth;
            const height = parent.offsetHeight;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw distortion effect - use larger grid for performance
            const gridSize = Math.max(8, Math.floor(16 / config.perlinscale));

            for (let x = 0; x < width; x += gridSize) {
                for (let y = 0; y < height; y += gridSize) {
                    const nx = x / width * config.perlinscale * 2;
                    const ny = y / height * config.perlinscale * 2;

                    const n = noise(nx + time, ny + time * 0.7, 12345);
                    const n2 = noise(nx * 1.5 - time * 0.3, ny * 1.5 + time * 0.5, 54321);

                    // Apply preset effects
                    let alpha = (n * config.mix + n2 * config.mix * 0.5);

                    if (config.flicker && Math.random() < 0.05 / config.frequency) {
                        alpha *= 0.5 + Math.random() * 0.5;
                    }

                    // Chromatic aberration effect
                    if (config.caIntensity > 0) {
                        const offset = config.caIntensity * 50;
                        ctx.fillStyle = `rgba(255, 100, 100, ${alpha * 0.3})`;
                        ctx.fillRect(x - offset, y, gridSize, gridSize);

                        ctx.fillStyle = `rgba(100, 100, 255, ${alpha * 0.3})`;
                        ctx.fillRect(x + offset, y, gridSize, gridSize);
                    }

                    // Main distortion visualization
                    const brightness = Math.floor((n * config.contrast1 + config.contrast2) * 255);
                    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;
                    ctx.fillRect(x, y, gridSize, gridSize);
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [mounted, preset]);

    if (!mounted) return null;

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay ${className}`}
            style={{ opacity: 0.4 }}
        />
    );
}

export default OuroborusEffect;
