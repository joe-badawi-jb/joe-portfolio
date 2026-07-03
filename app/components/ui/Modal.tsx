"use client";

import { useEffect, type ReactNode } from "react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
    // Close on Escape.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            className={`fixed inset-0 z-[200] flex items-center justify-center p-6 transition-opacity duration-300 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* dialog */}
            <div
                className={`relative w-full max-w-md rounded-2xl border border-hairline bg-surface-card p-8 shadow-2xl transition-transform duration-300 ${
                    open ? "scale-100" : "scale-95"
                }`}
            >
                {children}
            </div>
        </div>
    );
}
