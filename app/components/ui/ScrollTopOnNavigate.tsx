"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Resets scroll to the top whenever the route (pathname) changes, so every page
 * starts from the top. Skips when the URL has a hash so anchor links like
 * "/#about" still scroll to their section.
 */
export default function ScrollTopOnNavigate() {
    const pathname = usePathname();

    useEffect(() => {
        if (window.location.hash) return;
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
