'use client';

import React, { useEffect, useRef, useState } from 'react';

// Preset configurations from DIA Ouroborus
export const ouroborusPresets = {
    woodGrain: {
        name: 'Wood Grain',
        perlinscale: 1.5,
        dIntensity: 0.003,
        mix: 0.0,
        scaleFactor: 0.4,
        expandFactor: 0.0,
        caIntensity: 0.0,
        flicker: true,
        frequency: 1.0,
        contrast1: 1.0,
        contrast2: 0.0,
        noiseType: 0,
        perlinspeed: 0.15,
    },
    chroma: {
        name: 'Chroma',
        perlinscale: 3.0,
        dIntensity: 0.0015,
        mix: 0.06,
        scaleFactor: 0.2,
        expandFactor: 0.0,
        caIntensity: 0.001,
        flicker: false,
        frequency: 1.0,
        contrast1: 1.0,
        contrast2: 0.0,
        noiseType: 3,
        perlinspeed: 0.15,
    },
    inkBleed: {
        name: 'Ink Bleed',
        perlinscale: 4.5,
        dIntensity: 0.003,
        mix: 0.03,
        scaleFactor: 0.0,
        expandFactor: 1.5,
        caIntensity: 0.0,
        flicker: false,
        frequency: 1.0,
        contrast1: 1.0,
        contrast2: 0.0,
        noiseType: 2,
        perlinspeed: 0.15,
    },
    opArt: {
        name: 'Op Art',
        perlinscale: 1.0,
        dIntensity: 0.003,
        mix: 0.0,
        scaleFactor: 0.5,
        expandFactor: 0.0,
        caIntensity: 0.0,
        flicker: true,
        frequency: 10.0,
        contrast1: 0.2,
        contrast2: 0.01,
        noiseType: 4,
        perlinspeed: 0.15,
    },
    oldTv: {
        name: 'Old TV',
        perlinscale: 6.0,
        dIntensity: 0.0044,
        mix: 0.076,
        scaleFactor: 0.28,
        expandFactor: 0.0,
        caIntensity: 0.0012,
        flicker: true,
        frequency: 1.0,
        contrast1: 1.0,
        contrast2: 0.0,
        noiseType: 3,
        perlinspeed: 0.0,
    },
    fragments: {
        name: 'Fragments',
        perlinscale: 6.0,
        dIntensity: 0.007,
        mix: 0.17,
        scaleFactor: 0.43,
        expandFactor: 5.0,
        caIntensity: 0.004,
        flicker: true,
        frequency: 1.0,
        contrast1: 0.0,
        contrast2: 0.43,
        noiseType: 4,
        perlinspeed: 0.0,
    },
};

export type OuroborusPresetKey = keyof typeof ouroborusPresets | 'random';

interface OuroborusEffectProps {
    preset?: OuroborusPresetKey;
    className?: string;
}

// Simplified canvas-based distortion effect inspired by DIA Ouroborus
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
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        resize();
        window.addEventListener('resize', resize);

        // Noise function (simplified Perlin-like)
        const noise = (x: number, y: number, seed: number) => {
            const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
            return n - Math.floor(n);
        };

        const animate = () => {
            time += 0.016 * config.perlinspeed;

            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;

            // Clear with slight fade for trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);

            // Draw noise-based pattern
            const gridSize = Math.max(4, Math.floor(10 / config.perlinscale));

            for (let x = 0; x < width; x += gridSize) {
                for (let y = 0; y < height; y += gridSize) {
                    const nx = x / width * config.perlinscale;
                    const ny = y / height * config.perlinscale;

                    const n = noise(nx + time, ny + time, 12345);

                    // Apply preset effects
                    let alpha = n * config.mix;

                    if (config.flicker && Math.random() < 0.1 / config.frequency) {
                        alpha *= Math.random();
                    }

                    // Chromatic aberration effect
                    if (config.caIntensity > 0) {
                        ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.5})`;
                        ctx.fillRect(x - config.caIntensity * 100, y, gridSize, gridSize);

                        ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
                        ctx.fillRect(x + config.caIntensity * 100, y, gridSize, gridSize);
                    }

                    // Main noise visualization
                    const brightness = Math.floor((n * config.contrast1 + config.contrast2) * 255);
                    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;
                    ctx.fillRect(x, y, gridSize, gridSize);
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

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
            style={{ opacity: 0.3 }}
        />
    );
}

export default OuroborusEffect;
