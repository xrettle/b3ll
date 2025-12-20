'use client';

import { MeshGradient } from '@paper-design/shaders-react';
import { useEffect, useState } from 'react';

interface MeshGradientBgProps {
    colors?: string[];
    distortion?: number;
    swirl?: number;
    speed?: number;
    offsetX?: number;
    className?: string;
    veilOpacity?: string;
}

export function MeshGradientBg({
    colors = ['#72b9bb', '#b5d9d9', '#ffd1bd', '#ffebe0', '#8cc5b8', '#dbf4a4'],
    distortion = 0.8,
    swirl = 0.6,
    speed = 0.42,
    offsetX = 0.08,
    className = '',
    veilOpacity = 'bg-black/25',
}: MeshGradientBgProps) {
    const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const update = () =>
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    if (!mounted) return null;

    return (
        <div className={`fixed inset-0 w-screen h-screen ${className}`}>
            <MeshGradient
                width={dimensions.width}
                height={dimensions.height}
                colors={colors}
                distortion={distortion}
                swirl={swirl}
                grainMixer={0}
                grainOverlay={0}
                speed={speed}
                offsetX={offsetX}
            />
            <div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
        </div>
    );
}

export default MeshGradientBg;
