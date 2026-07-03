"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Resets scroll to the top whenever the route (pathname) changes, so every page
 * starts from the top. Skips when the URL has a hash so anchor links like
 * "/#about" still scroll to their section.
 *
 * The scroll is forced INSTANT (the global `scroll-behavior: smooth` would
 * otherwise animate it and can be interrupted mid-flight on mobile), and it's
 * repeated after paint + a short delay to beat layout shifts from lazily-loaded
 * 3D scenes / images — which is what was leaving mobile on the second section.
 */
export default function ScrollTopOnNavigate() {
    const pathname = usePathname();

    useEffect(() => {
        if (window.location.hash) return;

        const html = document.documentElement;
        const toTop = () => {
            const prev = html.style.scrollBehavior;
            html.style.scrollBehavior = "auto"; // bypass global smooth scroll
            window.scrollTo(0, 0);
            html.scrollTop = 0;
            document.body.scrollTop = 0;
            html.style.scrollBehavior = prev;
        };

        toTop();
        const raf = requestAnimationFrame(toTop);
        const timer = window.setTimeout(toTop, 150);

        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(timer);
        };
    }, [pathname]);

    return null;
}
