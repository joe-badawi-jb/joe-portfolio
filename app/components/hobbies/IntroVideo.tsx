"use client";

import { useEffect, useRef, useState } from "react";
import ModelWaiter from "@/app/components/ui/ModelWaiter";

type Phase = "playing" | "fading" | "done";

// The first model behind the intro — we don't reveal the page until it's loaded.
const FIRST_MODEL = "/assets/3d-models/goku_nimbus.glb";

/**
 * Fullscreen intro that plays a video (ideally with sound) on page load, then
 * fades out to reveal the page underneath.
 *
 * Browsers block autoplay WITH sound unless the document has a user gesture
 * (a client-side nav click counts; a hard reload does not). So we try sound
 * first and, if the browser refuses, fall back to muted playback and offer a
 * "tap for sound" affordance — the animation always plays either way.
 */
export default function IntroVideo({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [phase, setPhase] = useState<Phase>("playing");
    const [muted, setMuted] = useState(false);
    const [ready, setReady] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [wantFinish, setWantFinish] = useState(false);
    const exitStarted = useRef(false);

    const doExit = () => {
        if (exitStarted.current) return;
        exitStarted.current = true;
        setPhase("fading");
        window.setTimeout(() => {
            // Restore scrolling once the intro is gone. (The effect cleanup
            // only runs on unmount, and this component stays mounted after it
            // returns null — so unlock here explicitly.)
            document.body.classList.remove("overflow-hidden");
            setPhase("done");
            // Let the page know the intro is over (e.g. to show the Goku hint).
            window.dispatchEvent(new Event("intro:done"));
        }, 700);
    };

    // Request to end the intro (video ended / skipped / failed). Only actually
    // reveals the page once the first model is loaded, so nothing pops in.
    const requestFinish = () => setWantFinish(true);

    useEffect(() => {
        if (wantFinish && modelReady) doExit();
    }, [wantFinish, modelReady]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

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
                    // Even muted playback failed; just skip the intro.
                    requestFinish();
                }
            }
        };

        // Start the video only once the matrix loader has lifted, so it doesn't
        // play (with sound) hidden behind the loader. Fallback in case the
        // loader event never fires.
        let started = false;
        const startPlay = () => {
            if (started) return;
            started = true;
            play();
        };
        window.addEventListener("loader:done", startPlay);
        const fallback = window.setTimeout(startPlay, 6000);

        return () => {
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
                onPlaying={() => setReady(true)}
                onCanPlayThrough={() =>
                    window.dispatchEvent(new Event("video:ready"))
                }
                onError={() => window.dispatchEvent(new Event("video:ready"))}
                onEnded={requestFinish}
                className="h-full w-full object-cover"
            />

            {/* Hold the reveal until the first model has loaded. */}
            <ModelWaiter
                path={FIRST_MODEL}
                onReady={() => setModelReady(true)}
            />

            {/* Buffering spinner while the video loads/starts. */}
            {!ready && phase === "playing" && (
                <span className="absolute h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-white" />
            )}

            {/* If the video ended but the scene isn't ready yet, keep a loader. */}
            {wantFinish && !modelReady && phase === "playing" && (
                <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white/90 backdrop-blur">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Preparing the scene…
                </div>
            )}

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

            {/* Always allow skipping. */}
            <button
                type="button"
                onClick={requestFinish}
                className="absolute right-6 top-6 rounded-full border border-white/40 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white/90 transition-colors hover:bg-white/10"
            >
                Skip
            </button>
        </div>
    );
}
