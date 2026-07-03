"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

// Below-the-fold models, in the order they appear on the page. They're warmed
// ONE AT A TIME (each finishes before the next starts) so they don't saturate
// the connection, and each is cached before the user scrolls to it — so its
// canvas renders instantly with no pop or wait. The first model (Goku) is
// preloaded separately in its own component, since it's visible immediately.
const SEQUENCE = [
    "/assets/3d-models/naruto_running.glb",
    "/assets/3d-models/dumbbel.glb",
    "/assets/3d-models/football.glb",
    "/assets/3d-models/basketball_ball.glb",
    "/assets/3d-models/pacman.glb",
];

export default function ModelPreloader() {
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            for (const path of SEQUENCE) {
                if (cancelled) return;
                try {
                    // Fully download (fetch resolves on headers; read the body
                    // so it's really cached) before moving to the next model.
                    const res = await fetch(path, { cache: "force-cache" });
                    await res.arrayBuffer();
                    useGLTF.preload(path); // parse into three's cache
                } catch {
                    // ignore — the model will just load on demand as a fallback
                }
            }
        };

        // Start warming only AFTER the intro video is done, so the sequence
        // doesn't compete with the video for bandwidth. Fallback timer covers
        // the case where the intro is skipped or never fires.
        let started = false;
        const start = () => {
            if (started) return;
            started = true;
            run();
        };
        window.addEventListener("intro:done", start);
        const fallback = window.setTimeout(start, 8000);

        return () => {
            cancelled = true;
            window.removeEventListener("intro:done", start);
            window.clearTimeout(fallback);
        };
    }, []);

    return null;
}
