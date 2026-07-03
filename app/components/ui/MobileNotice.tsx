"use client";

import { useEffect, useState } from "react";
import Modal from "@/app/components/ui/Modal";

/**
 * First-visit notice recommending desktop. Shown once per session on smaller
 * screens, where the immersive 3D / interactive details are harder to enjoy.
 */
export default function MobileNotice() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const small = window.matchMedia("(max-width: 768px)").matches;
        if (!small) return;
        if (sessionStorage.getItem("desktop-notice-seen")) return;
        // Let the initial loading intro settle before showing.
        const id = window.setTimeout(() => setOpen(true), 1500);
        return () => window.clearTimeout(id);
    }, []);

    const close = () => {
        sessionStorage.setItem("desktop-notice-seen", "1");
        setOpen(false);
    };

    return (
        <Modal open={open} onClose={close}>
            <div className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-blue/15 text-accent-blue">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7"
                        aria-hidden
                    >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-content">
                    Best experienced on desktop
                </h3>
                <p className="mt-3 text-muted">
                    This portfolio features immersive 3D scenes and interactive
                    details that truly come to life on a larger screen. For the
                    full experience, I recommend visiting on desktop.
                </p>
                <button
                    type="button"
                    onClick={close}
                    className="mt-6 rounded-full border-2 border-accent-pink px-6 py-2 text-sm font-semibold uppercase tracking-widest text-accent-pink transition-colors hover:bg-accent-pink hover:text-white"
                >
                    Continue anyway
                </button>
            </div>
        </Modal>
    );
}
