"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";

// useGLTF suspends until the model is fully downloaded AND parsed into cache
// (works outside a <Canvas> — it only loads the data). When it resolves, this
// mounts and fires onReady exactly once. Rendered behind a Suspense boundary so
// the suspension is contained.
function Loaded({ path, onReady }: { path: string; onReady: () => void }) {
    useGLTF(path);
    const fired = useRef(false);
    useEffect(() => {
        if (fired.current) return;
        fired.current = true;
        onReady();
    });
    return null;
}

/**
 * Invisible gate that calls `onReady` once the given model has finished loading
 * and parsing. Used by loaders/intros to hold until the first scene is ready.
 */
export default function ModelWaiter({
    path,
    onReady,
}: {
    path: string;
    onReady: () => void;
}) {
    // Client-only: useGLTF must not run during SSR/prerender (relative asset
    // URLs can't be fetched on the server).
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // Intentional one-shot mount flag so this only runs on the client.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);
    if (!mounted) return null;

    return (
        <Suspense fallback={null}>
            <Loaded path={path} onReady={onReady} />
        </Suspense>
    );
}
