"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders its children only once the wrapper scrolls near the viewport. Used to
 * defer mounting heavy 3D canvases so their models download on demand (as the
 * user scrolls) instead of all at once on page load. `rootMargin` pre-mounts a
 * little before it enters view so it's ready by the time it's visible.
 */
export default function InView({
    children,
    className,
    rootMargin = "300px",
}: {
    children: ReactNode;
    className?: string;
    rootMargin?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    io.disconnect();
                }
            },
            { rootMargin }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [rootMargin]);

    return (
        <div ref={ref} className={className}>
            {visible && (
                <div className="model-fade-in h-full w-full">{children}</div>
            )}
        </div>
    );
}
