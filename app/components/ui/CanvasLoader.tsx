"use client";

import { Html, useProgress } from "@react-three/drei";

/**
 * Small in-canvas loading indicator, used as a <Suspense> fallback while a GLB
 * downloads/decodes. Shows the load percentage so there's never a blank gap.
 */
export default function CanvasLoader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex items-center gap-2 whitespace-nowrap rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {Math.round(progress)}%
            </div>
        </Html>
    );
}
