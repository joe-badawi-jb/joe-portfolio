"use client";

import { useEffect, useRef } from "react";

// A lightweight particles.js-style background: drifting dots connected by
// faint lines when they're near each other. Pure canvas — no dependencies,
// no SSR quirks. Colours are pulled from the palette so it stays on-brand.
const LINK_DIST = 130; // px distance under which two dots are linked
const AREA_PER_DOT = 13000; // lower = denser
const MAX_DOTS = 90;

type Dot = { x: number; y: number; vx: number; vy: number; color: string };

export default function ParticlesBackground({
    className = "",
}: {
    className?: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const styles = getComputedStyle(document.documentElement);
        const blue = styles.getPropertyValue("--accent-blue").trim() || "#3b82f6";
        const pink = styles.getPropertyValue("--accent-pink").trim() || "#ec4899";

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let w = 0;
        let h = 0;
        let dots: Dot[] = [];

        const build = () => {
            const rect = canvas.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            if (w === 0 || h === 0) return;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(Math.round((w * h) / AREA_PER_DOT), MAX_DOTS);
            dots = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                color: Math.random() < 0.5 ? blue : pink,
            }));
        };
        build();

        const ro = new ResizeObserver(build);
        ro.observe(canvas);

        let raf = 0;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            ctx.clearRect(0, 0, w, h);

            // Links between nearby dots.
            for (let i = 0; i < dots.length; i++) {
                const a = dots[i];
                for (let j = i + 1; j < dots.length; j++) {
                    const b = dots[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < LINK_DIST) {
                        ctx.strokeStyle = `rgba(148, 163, 184, ${
                            (1 - dist / LINK_DIST) * 0.4
                        })`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            // Dots.
            for (const d of dots) {
                if (!reduce) {
                    d.x += d.vx;
                    d.y += d.vy;
                    if (d.x < 0 || d.x > w) d.vx *= -1;
                    if (d.y < 0 || d.y > h) d.vy *= -1;
                }
                ctx.fillStyle = d.color;
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, []);

    return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} />;
}
