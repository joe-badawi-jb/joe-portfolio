"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ContactButton from "../buttons/ContactButton";

const NAV_LINKS = [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Skills", href: "#skills" },
];

// Animated left->right strikethrough + colour shift on hover (see
// `.nav-link` in globals.css), shared by desktop and mobile links.
const navLinkClasses = "nav-link text-xl font-medium text-content";

// Alternate the per-item accent: blue, pink, blue, pink, ...
const accentByIndex = (i: number) =>
    i % 2 === 0 ? "nav-accent-blue" : "nav-accent-pink";

export default function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-hairline bg-surface/80 backdrop-blur">
            <nav className="container flex items-center justify-between py-4">
                {/* Logo */}
                <Link href="/" className="shrink-0" aria-label="Home">
                    <Image
                        src="/assets/icons/joe-logo.png"
                        alt="Joe logo"
                        width={80}
                        height={80}
                        priority
                        className="object-cover rounded-[50%]"
                    />
                </Link>

                {/* Desktop nav (centered) */}
                <ul className="hidden items-center gap-6 md:flex">
                    {NAV_LINKS.map((link, i) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`${navLinkClasses} ${accentByIndex(i)}`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Desktop CTA */}
                <div className="hidden md:block">
                    <ContactButton />
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    className="relative h-6 w-6 md:hidden"
                >
                    <span
                        className={`absolute left-0 h-0.5 w-6 bg-content transition-all ${
                            open ? "top-3 rotate-45" : "top-1"
                        }`}
                    />
                    <span
                        className={`absolute left-0 top-3 h-0.5 w-6 bg-content transition-all ${
                            open ? "opacity-0" : "opacity-100"
                        }`}
                    />
                    <span
                        className={`absolute left-0 h-0.5 w-6 bg-content transition-all ${
                            open ? "top-3 -rotate-45" : "top-5"
                        }`}
                    />
                </button>
            </nav>

            {/* Mobile menu — always rendered so it can animate open/close */}
            <div
                aria-hidden={!open}
                className={`overflow-hidden bg-surface px-6 transition-all md:hidden ${
                    open
                        ? "max-h-[500px] border-t border-hairline py-5 opacity-100"
                        : "pointer-events-none max-h-0 py-0 opacity-0"
                }`}
            >
                <ul className="flex flex-col gap-6">
                    {NAV_LINKS.map((link, i) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`${navLinkClasses} text-2xl ${accentByIndex(i)}`}
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="mt-6">
                    <ContactButton className="w-full" />
                </div>
            </div>
        </header>
    );
}
