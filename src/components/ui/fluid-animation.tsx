'use client';

import React, { useEffect, useRef, useState } from 'react';

// Vector2 class implementation
class Vector2 {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }
}

// Utility function
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

interface FluidAnimationProps {
    width?: string;
    height?: string;
    seed?: number | null;
    complexity?: number;
    mouseSpeed?: number;
    fixedOffset?: number;
    fluidSpeed?: number;
    baseColor?: number;
    blur?: number;
    morphSpeed?: number;
    className?: string;
}

export function FluidAnimation({
    width = "100%",
    height = "100%",
    seed = null,
    complexity = 10,
    mouseSpeed = 0.3,
    fixedOffset = 0.7,
    fluidSpeed = 0.07,
    baseColor = 0.6,
    blur = 0.47,
    morphSpeed = 0.1,
    className = ''
}: FluidAnimationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [morphAmount, setMorphAmount] = useState(0);
    const mouseRef = useRef({ x: 0, y: 0 });
    const isPressing = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        // Generate seed
        const actualSeed = seed || (new Date().getTime() % 100000);

        // Handle mouse/touch events
        const updatePosition = (clientX: number, clientY: number) => {
            const rect = canvas.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);
            mouseRef.current.x = ((clientX - rect.left) * 2 - rect.width) / size;
            mouseRef.current.y = ((rect.height - (clientY - rect.top)) * 2 - rect.height) / size;
        };

        const handleMove = (e: MouseEvent | TouchEvent) => {
            if ('touches' in e) {
                updatePosition(e.touches[0].clientX, e.touches[0].clientY);
            } else {
                updatePosition(e.clientX, e.clientY);
            }
        };

        const handleDown = () => {
            isPressing.current = true;
        };

        const handleUp = () => {
            isPressing.current = false;
        };

        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('touchmove', handleMove);
        canvas.addEventListener('mousedown', handleDown);
        canvas.addEventListener('touchstart', handleDown);
        canvas.addEventListener('mouseup', handleUp);
        canvas.addEventListener('touchend', handleUp);

        // Vertex shader
        const vertexShaderSource = `
      attribute vec2 position;
      void main () {
        gl_Position = vec4(position, 0, 1);
      }
    `;

        // Fragment shader
        const fragmentShaderSource = `
      precision mediump float;
      #define SEED ${actualSeed}.579831

      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uMorph;
      uniform vec2 uGrid;

      const int complexity = ${complexity};
      const float mouseSpeed = ${mouseSpeed.toFixed(2)};
      const float fixedOffset = ${fixedOffset.toFixed(2)};
      const float fluidSpeed = ${fluidSpeed.toFixed(2)};
      const float baseColor = ${baseColor.toFixed(2)};
      const float BLUR = ${blur.toFixed(2)};

      #define PI 3.14159

      float random(float x) {
        return fract(sin(x) * SEED);
      }
      float noise(float x) {
        float i = floor(x);
        float f = fract(x);
        return mix(random(i), random(i + 1.0), smoothstep(0.0, 1.0, f));
      }
      float noiseS(float x) {
        return noise(x) * 2.0 - 1.0;
      }

      void main() {
        vec2 p = (2.0 * gl_FragCoord.xy - uResolution) / min(uResolution.x, uResolution.y) * 0.7;
        float t = uTime * fluidSpeed + uMorph;
        float noiseTime = noise(t);
        float noiseSTime = noiseS(t);
        float noiseSTime1 = noiseS(t + 1.0);

        float blur = (BLUR + 0.14 * noiseSTime);
        for(int i=1; i <= complexity; i++) {
          p += blur / float(i) * sin(
              float(i) * p.yx + t + PI * vec2(noiseSTime, noiseSTime1))
            + fixedOffset;
        }
        for(int i=1; i <= complexity; i++) {
          p += blur / float(i) * cos(
              float(i) * p.yx + t + PI * vec2(noiseSTime, noiseSTime1))
            + fixedOffset;
        }
        p += uMouse * mouseSpeed;

        vec2 grid = uGrid * 2.0;
        gl_FragColor = vec4(
          baseColor * vec3(
            sin(grid * p + vec2(2.0 * noiseSTime, 3.0 * noiseSTime1)),
            sin(p.x + p.y + noiseSTime)
          )
          + baseColor,
          1.0);
      }
    `;

        // Create shaders
        const createShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) return;

        // Create program
        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        // Create buffer
        const positionBuffer = gl.createBuffer();
        const positions = new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, 1, 1, -1
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        // Get attribute and uniform locations
        const positionAttributeLocation = gl.getAttribLocation(program, 'position');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'uResolution');
        const timeUniformLocation = gl.getUniformLocation(program, 'uTime');
        const mouseUniformLocation = gl.getUniformLocation(program, 'uMouse');
        const morphUniformLocation = gl.getUniformLocation(program, 'uMorph');
        const gridUniformLocation = gl.getUniformLocation(program, 'uGrid');

        // Resize handler - use lower resolution for performance
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio, 1); // Cap at 1x for performance
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        resize();
        window.addEventListener('resize', resize);

        // Animation loop with FPS limiting for better performance
        const startTime = Date.now();
        let animationId: number;
        let currentMorph = 0;
        let lastFrameTime = 0;
        const targetFPS = 30;
        const frameInterval = 1000 / targetFPS;

        const render = (timestamp: number) => {
            // FPS limiting to reduce CPU/GPU load
            if (timestamp - lastFrameTime < frameInterval) {
                animationId = requestAnimationFrame(render);
                return;
            }
            lastFrameTime = timestamp;

            const currentTime = Date.now();
            const time = (currentTime - startTime) * 0.01;

            if (isPressing.current) {
                currentMorph += 0.016 * morphSpeed;
            }

            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);

            // Set uniforms
            gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
            gl.uniform1f(timeUniformLocation, time);
            gl.uniform2f(mouseUniformLocation, mouseRef.current.x, mouseRef.current.y);
            gl.uniform1f(morphUniformLocation, currentMorph);

            const ratio = 0.32;
            const gridX = canvas.height >= canvas.width ? 1 : canvas.width / canvas.height * ratio;
            const gridY = canvas.height >= canvas.width ? canvas.height / canvas.width * ratio : 1;
            gl.uniform2f(gridUniformLocation, gridX, gridY);

            // Set attributes
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            // Draw
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationId = requestAnimationFrame(render);
        };

        requestAnimationFrame(render);

        // Cleanup
        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMove);
            canvas.removeEventListener('touchmove', handleMove);
            canvas.removeEventListener('mousedown', handleDown);
            canvas.removeEventListener('touchstart', handleDown);
            canvas.removeEventListener('mouseup', handleUp);
            canvas.removeEventListener('touchend', handleUp);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(positionBuffer);
        };
    }, [seed, complexity, mouseSpeed, fixedOffset, fluidSpeed, baseColor, blur, morphSpeed]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full ${className}`}
            style={{ width, height }}
        />
    );
}

export default FluidAnimation;
