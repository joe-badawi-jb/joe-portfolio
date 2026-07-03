"use client";

import { useEffect, useState } from "react";

/**
 * Shows a one-off popup once the intro video finishes, telling desktop users
 * they can fly Goku with the arrow keys. Skipped on touch devices (no arrows).
 * Listens for the "intro:done" event dispatched by IntroVideo.
 */
export default function GokuHintPopup() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onDone = () => {
            // Desktop / keyboard only — touch users have no arrow keys.
            if (!window.matchMedia("(pointer: fine)").matches) return;
            setVisible(true);
        };
        window.addEventListener("intro:done", onDone);
        return () => window.removeEventListener("intro:done", onDone);
    }, []);

    // Auto-dismiss after a few seconds.
    useEffect(() => {
        if (!visible) return;
        const id = window.setTimeout(() => setVisible(false), 7000);
        return () => window.clearTimeout(id);
    }, [visible]);

    return (
        <div
            aria-hidden={!visible}
            className={`pointer-events-none fixed inset-x-0 top-28 z-[60] flex justify-center px-4 transition-all ${
                visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
            }`}
        >
            <div
                className={`flex items-center gap-4 rounded-2xl border border-rose-500/40 bg-black/80 px-6 py-4 text-white shadow-2xl backdrop-blur ${
                    visible ? "pointer-events-auto" : "pointer-events-none"
                }`}
            >
                <span className="text-2xl" aria-hidden>
                    🕹️
                </span>
                <p className="text-sm md:text-base">
                    Psst — use your{" "}
                    <span className="font-semibold text-rose-400">
                        arrow keys
                    </span>{" "}
                    to fly Goku around!
                </p>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    aria-label="Dismiss"
                    className="ml-2 rounded-full p-1 text-lg leading-none text-white/70 transition-colors hover:text-white"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
