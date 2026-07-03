"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Minimum time the loader is shown (also when the hero intro starts), a hard
// cap so it never hangs, and how long the exit wipe takes.
export const LOADER_DURATION_MS = 3000;
const MAX_MS = 12000;
const EXIT_MS = 600;

// Friendly, rotating status lines shown while the first scene loads.
const MESSAGES = [
    "Loading 3D models…",
    "Preparing interactive animations…",
    "Warming up the scene…",
    "Almost ready…",
];

// The most important model for the page you land on — the loader waits for it
// so the first scene is ready the moment the loader lifts.
function criticalModel(pathname: string | null): string | null {
    if (pathname === "/")
        return "/assets/3d-models/modern_desk_setup__game_ready_3d_model.glb";
    if (pathname?.startsWith("/hobbies"))
        return "/assets/3d-models/goku_nimbus.glb";
    return null;
}

/**
 * Matrix-style "digital rain" shown on the initial page load, with a spinner
 * and rotating status messages. It stays up until BOTH a minimum time has
 * passed AND the first 3D model has downloaded (capped by MAX_MS), so users
 * see a friendly loading state instead of a blank wait. Respects
 * prefers-reduced-motion.
 */
export default function MatrixLoader() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pathname = usePathname();
    const [exiting, setExiting] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [msg, setMsg] = useState(0);
    const exitStarted = useRef(false);

    // Rotate the status messages.
    useEffect(() => {
        const id = window.setInterval(
            () => setMsg((m) => (m + 1) % MESSAGES.length),
            1600
        );
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        // Skip the animation entirely for reduced-motion users. This is a
        // one-shot, mount-time shortcut (matchMedia is client-only), so the
        // synchronous setState here is intentional.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
        const stepInterval = 28;

        const render = (time: number) => {
            raf = requestAnimationFrame(render);
            if (time - last < stepInterval) return;
            last = time;

            ctx.fillStyle = "rgba(10, 10, 15, 0.12)";
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < drops.length; i++) {
                const bit = Math.random() < 0.5 ? "0" : "1";
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                ctx.fillStyle = Math.random() < 0.15 ? head : blue;
                ctx.fillText(bit, x, y);
                if (y > height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        raf = requestAnimationFrame(render);

        // --- Dismissal: wait for min time AND the first model, capped by MAX.
        let minPassed = false;
        let assetReady = false;

        const startExit = () => {
            if (exitStarted.current) return;
            exitStarted.current = true;
            setExiting(true);
            window.setTimeout(() => setHidden(true), EXIT_MS);
            // Let the hero know it can start its intro now.
            window.dispatchEvent(new Event("loader:done"));
        };
        const maybeExit = () => {
            if (minPassed && assetReady) startExit();
        };

        const minTimer = window.setTimeout(() => {
            minPassed = true;
            maybeExit();
        }, LOADER_DURATION_MS);
        const maxTimer = window.setTimeout(startExit, MAX_MS);

        const model = criticalModel(pathname);
        if (model) {
            fetch(model, { cache: "force-cache" })
                .then((r) => r.arrayBuffer())
                .catch(() => {})
                .finally(() => {
                    assetReady = true;
                    maybeExit();
                });
        } else {
            assetReady = true;
        }

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            window.clearTimeout(minTimer);
            window.clearTimeout(maxTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            {/* Friendly status overlay. */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-accent-blue/25 border-t-accent-blue" />
                <div className="space-y-2">
                    <p
                        key={msg}
                        className="model-fade-in font-mono text-base font-medium text-content drop-shadow-lg md:text-lg"
                    >
                        {MESSAGES[msg]}
                    </p>
                    <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted drop-shadow md:text-sm">
                        For the full experience and advanced animations, we
                        recommend viewing on desktop.
                    </p>
                </div>
            </div>
        </div>
    );
}
