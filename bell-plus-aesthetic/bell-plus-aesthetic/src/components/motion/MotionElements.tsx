'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Animated circle with pulsing effect
export function PulsingCircle({
  size = 300,
  color = 'rgba(255, 255, 255, 0.1)',
  duration = 10,
  delay = 0,
  scale = [0.8, 1.2, 0.8],
  className = '',
  style = {}
}: {
  size?: number;
  color?: string;
  duration?: number;
  delay?: number;
  scale?: number[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        ...style
      }}
      animate={{
        scale: scale
      }}
      transition={{
        repeat: Infinity,
        duration: duration,
        ease: "easeInOut",
        delay: delay
      }}
    />
  );
}

// Glowing dot that follows mouse
export function GlowingDot() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-50 rounded-full mix-blend-screen"
      style={{
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
        left: mousePosition.x - 100,
        top: mousePosition.y - 100
      }}
      animate={{
        opacity: [0.7, 0.9, 0.7]
      }}
      transition={{
        repeat: Infinity,
        duration: 0.5
      }}
    />
  );
}

// Floating text that responds to scroll
export function FloatingElement({
  children,
  yOffset = [-20, 20],
  duration = 20,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  yOffset?: [number, number];
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], yOffset);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={{
        y,
        ...style
      }}
    >
      {children}
    </motion.div>
  );
}

// Parallax background section
export function ParallaxBackground() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-900 to-blue-900"></div>;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(45deg, rgba(74, 0, 224, 0.1) 0%, rgba(142, 45, 226, 0.1) 100%)',
          y: y1
        }}
      />

      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-10 bg-purple-500 blur-3xl"
        style={{ y: y2 }}
      />

      <motion.div
        className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-10 bg-blue-600 blur-3xl"
        style={{ y: y3 }}
      />
    </div>
  );
}

// Moving grid pattern
export function MovingGrid({
  size = 40,
  columns = 20,
  rows = 20
}: {
  size?: number;
  columns?: number;
  rows?: number;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!mounted) return null;

  const gridPoints = [];
  for (let i = 0; i < columns * rows; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);

    // Calculate distance from mouse to create wave effect
    const dx = col / columns - mousePosition.x;
    const dy = row / rows - mousePosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = Math.sqrt(0.5 * 0.5 + 0.5 * 0.5); // max possible distance
    const intensity = Math.max(0, 1 - distance / (maxDistance * 0.5));

    gridPoints.push(
      <motion.div
        key={i}
        className="absolute bg-white rounded-full"
        style={{
          width: 2,
          height: 2,
          left: (col / columns) * 100 + '%',
          top: (row / rows) * 100 + '%',
        }}
        animate={{
          scale: 1 + intensity * 2,
          opacity: 0.2 + intensity * 0.8,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      />
    );
  }

  return (
    <div
      ref={gridRef}
      className="absolute inset-0 overflow-hidden opacity-20"
    >
      <div className="relative w-full h-full">
        {gridPoints}
      </div>
    </div>
  );
}
