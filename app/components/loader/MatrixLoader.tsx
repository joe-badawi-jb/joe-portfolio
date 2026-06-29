"use client";

import { useEffect, useRef, useState } from "react";

// Total time the loader is shown, and how long the exit wipe takes.
export const LOADER_DURATION_MS = 2000;
const EXIT_MS = 600;

/**
 * Matrix-style "digital rain" of bits (0/1) shown on initial page load.
 * Rendered on a <canvas> (no assets required). After TOTAL_MS the overlay
 * wipes out from the bottom (see `.matrix-loader` / `.matrix-exit` in
 * globals.css) and unmounts. Respects prefers-reduced-motion.
 */
export default function MatrixLoader() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [exiting, setExiting] = useState(false);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        // Skip the animation entirely for reduced-motion users.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setHidden(true);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        // Pull colours from the palette so the rain stays on-brand.
        const styles = getComputedStyle(document.documentElement);
        const blue = styles.getPropertyValue("--accent-blue").trim() || "#3b82f6";
        const head = styles.getPropertyValue("--content").trim() || "#e5e7eb";

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const fontSize = 16;
        let width = 0;
        let height = 0;
        let drops: number[] = [];

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const columns = Math.ceil(width / fontSize);
            const rows = height / fontSize;
            // Seed columns across the whole height (plus some above the top)
            // so the screen is immersed in numbers almost immediately.
            drops = Array.from({ length: columns }, () =>
                Math.floor(Math.random() * (rows + 25) - 25)
            );
            ctx.font = `${fontSize}px monospace`;
            ctx.textBaseline = "top";
        };
        resize();
        window.addEventListener("resize", resize);

        let raf = 0;
        let last = 0;
        const stepInterval = 28; // ms between rows falling (lower = faster)

        const render = (time: number) => {
            raf = requestAnimationFrame(render);
            if (time - last < stepInterval) return;
            last = time;

            // Translucent surface (#0a0a0f) draw fades the previous frame,
            // leaving the characteristic fading trails.
            ctx.fillStyle = "rgba(10, 10, 15, 0.12)";
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < drops.length; i++) {
                const bit = Math.random() < 0.5 ? "0" : "1";
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Sprinkle bright "head" characters among the blue stream.
                ctx.fillStyle = Math.random() < 0.15 ? head : blue;
                ctx.fillText(bit, x, y);

                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        raf = requestAnimationFrame(render);

        const exitTimer = setTimeout(
            () => setExiting(true),
            LOADER_DURATION_MS - EXIT_MS
        );
        const hideTimer = setTimeout(() => setHidden(true), LOADER_DURATION_MS);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            clearTimeout(exitTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    if (hidden) return null;

    return (
        <div
            aria-hidden
            className={`matrix-loader fixed inset-0 z-[100] bg-surface ${
                exiting ? "matrix-exit" : ""
            }`}
        >
            <canvas ref={canvasRef} className="block h-full w-full" />
        </div>
    );
}
