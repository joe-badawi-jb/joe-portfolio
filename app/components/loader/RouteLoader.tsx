"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MatrixLoader from "./MatrixLoader";

/**
 * Decides when the branded loader shows:
 *  - the very first page load (any page), and
 *  - whenever redirecting to /hobbies.
 *
 * On other client navigations (e.g. back to home) it's skipped so the page
 * appears instantly — but it still fires "loader:done" immediately so anything
 * waiting on the loader (the hero intro) triggers right away instead of hanging
 * on its fallback timer. The MatrixLoader is keyed by pathname so each qualifying
 * navigation runs a fresh loading cycle.
 */
export default function RouteLoader() {
    const pathname = usePathname();
    const [hasNavigated, setHasNavigated] = useState(false);
    const prevPath = useRef(pathname);

    // Detect the first client navigation (ref is only read inside the effect).
    useEffect(() => {
        if (prevPath.current !== pathname) {
            prevPath.current = pathname;
            // Marking that a navigation happened — a genuine sync with the
            // router, so this setState in the effect is intentional.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (!hasNavigated) setHasNavigated(true);
        }
    }, [pathname, hasNavigated]);

    const isFirstLoad = !hasNavigated;
    const show = isFirstLoad || pathname.startsWith("/hobbies");

    useEffect(() => {
        if (show) return;
        // No loader for this navigation — let the hero start immediately.
        // Deferred so listeners mounted this cycle are already registered.
        const id = window.setTimeout(
            () => window.dispatchEvent(new Event("loader:done")),
            0
        );
        return () => window.clearTimeout(id);
    }, [show, pathname]);

    if (!show) return null;
    return <MatrixLoader key={pathname} />;
}
