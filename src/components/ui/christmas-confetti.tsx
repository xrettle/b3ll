'use client';

import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
    id: number;
    x: number;
    y: number;
    rotation: number;
    size: number;
    color: string;
    speed: number;
    wobble: number;
    type: 'flake' | 'star' | 'circle' | 'tree';
}

const CHRISTMAS_COLORS = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#ffffff', // White
    '#ffd700', // Gold
    '#ff6b6b', // Light red
    '#90EE90', // Light green
];

export function ChristmasConfetti() {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        // Create initial confetti
        const initialPieces: ConfettiPiece[] = [];
        for (let i = 0; i < 50; i++) {
            initialPieces.push(createPiece(i));
        }
        setPieces(initialPieces);

        // Animation loop
        const interval = setInterval(() => {
            setPieces(prev => {
                return prev.map(piece => {
                    let newY = piece.y + piece.speed;
                    let newX = piece.x + Math.sin(piece.wobble + piece.y * 0.02) * 0.5;
                    let newRotation = piece.rotation + piece.speed * 2;

                    // Reset if off screen
                    if (newY > window.innerHeight + 20) {
                        return createPiece(piece.id, true);
                    }

                    return {
                        ...piece,
                        y: newY,
                        x: newX,
                        rotation: newRotation,
                    };
                });
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    function createPiece(id: number, fromTop = false): ConfettiPiece {
        const types: ('flake' | 'star' | 'circle' | 'tree')[] = ['flake', 'star', 'circle', 'tree'];
        return {
            id,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: fromTop ? -20 : Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            rotation: Math.random() * 360,
            size: 8 + Math.random() * 12,
            color: CHRISTMAS_COLORS[Math.floor(Math.random() * CHRISTMAS_COLORS.length)],
            speed: 0.5 + Math.random() * 1.5,
            wobble: Math.random() * Math.PI * 2,
            type: types[Math.floor(Math.random() * types.length)],
        };
    }

    const renderPiece = (piece: ConfettiPiece) => {
        const commonStyle: React.CSSProperties = {
            position: 'absolute',
            left: piece.x,
            top: piece.y,
            transform: `rotate(${piece.rotation}deg)`,
            pointerEvents: 'none',
            opacity: 0.8,
        };

        switch (piece.type) {
            case 'flake':
                return (
                    <div
                        key={piece.id}
                        style={{
                            ...commonStyle,
                            fontSize: piece.size,
                            color: piece.color,
                        }}
                    >
                        ❄
                    </div>
                );
            case 'star':
                return (
                    <div
                        key={piece.id}
                        style={{
                            ...commonStyle,
                            fontSize: piece.size,
                            color: '#ffd700',
                        }}
                    >
                        ⭐
                    </div>
                );
            case 'tree':
                return (
                    <div
                        key={piece.id}
                        style={{
                            ...commonStyle,
                            fontSize: piece.size,
                            color: '#00ff00',
                        }}
                    >
                        🎄
                    </div>
                );
            case 'circle':
            default:
                return (
                    <div
                        key={piece.id}
                        style={{
                            ...commonStyle,
                            width: piece.size,
                            height: piece.size,
                            backgroundColor: piece.color,
                            borderRadius: '50%',
                        }}
                    />
                );
        }
    };

    return (
        <div
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
            aria-hidden="true"
        >
            {pieces.map(renderPiece)}
        </div>
    );
}

export default ChristmasConfetti;
