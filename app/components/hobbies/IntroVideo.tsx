"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "playing" | "fading" | "done";

/**
 * Fullscreen intro video for the hobbies page. The matrix loader keeps showing
 * until this video is buffered (it listens for the "video:ready" event we fire
 * on canplaythrough) and only then lifts — so the video plays immediately with
 * NO separate loading screen. It starts on "loader:done" (once the loader has
 * lifted) and fades out to reveal the page when it ends.
 */
export default function IntroVideo({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [phase, setPhase] = useState<Phase>("playing");
    const [muted, setMuted] = useState(false);
    const exitStarted = useRef(false);

    const finish = () => {
        if (exitStarted.current) return;
        exitStarted.current = true;
        setPhase("fading");
        window.setTimeout(() => {
            // Restore scrolling once the intro is gone. (The effect cleanup
            // only runs on unmount, and this component stays mounted after it
            // returns null — so unlock here explicitly.)
            document.body.classList.remove("overflow-hidden");
            setPhase("done");
            // Let the page know the intro is over (e.g. to show the Goku hint
            // and start streaming the other models).
            window.dispatchEvent(new Event("intro:done"));
        }, 700);
    };

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        // Force the page to the top BEFORE locking scroll, so the hobbies page
        // never opens at the previous page's scroll position (e.g. contact).
        const html = document.documentElement;
        const prevBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        window.scrollTo(0, 0);
        html.style.scrollBehavior = prevBehavior;

        // Lock scrolling while the intro covers the screen.
        document.body.classList.add("overflow-hidden");

        const play = async () => {
            try {
                v.muted = false;
                v.volume = 1;
                await v.play();
            } catch {
                // Sound blocked — play muted so the visuals still run.
                v.muted = true;
                setMuted(true);
                try {
                    await v.play();
                } catch {
                    // Even muted playback failed; just reveal the page.
                    finish();
                }
            }
        };

        // The matrix loader tells us to start ("intro:play") while it's still
        // fully covering the screen; it only fades once we report we're playing
        // (onPlaying -> "video:playing"). "loader:done" is a safety fallback.
        let started = false;
        const startPlay = () => {
            if (started) return;
            started = true;
            play();
        };
        window.addEventListener("intro:play", startPlay);
        window.addEventListener("loader:done", startPlay);
        const fallback = window.setTimeout(startPlay, 6000);

        return () => {
            window.removeEventListener("intro:play", startPlay);
            window.removeEventListener("loader:done", startPlay);
            window.clearTimeout(fallback);
            document.body.classList.remove("overflow-hidden");
        };
    }, []);

    const enableSound = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = false;
        v.volume = 1;
        setMuted(false);
        v.play().catch(() => {});
    };

    if (phase === "done") return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-700 ${
                phase === "fading" ? "opacity-0" : "opacity-100"
            }`}
        >
            <video
                ref={videoRef}
                src={src}
                playsInline
                preload="auto"
                onCanPlayThrough={() =>
                    window.dispatchEvent(new Event("video:ready"))
                }
                onPlaying={() =>
                    window.dispatchEvent(new Event("video:playing"))
                }
                onError={() => {
                    // Don't leave the loader hanging if the video fails.
                    window.dispatchEvent(new Event("video:ready"));
                    window.dispatchEvent(new Event("video:playing"));
                }}
                onEnded={finish}
                className="h-full w-full object-cover"
            />

            {/* Offer sound if autoplay forced us to start muted. */}
            {muted && phase === "playing" && (
                <button
                    type="button"
                    onClick={enableSound}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black shadow-lg transition-transform hover:scale-105"
                >
                    🔊 Tap for sound
                </button>
            )}
        </div>
    );
}
