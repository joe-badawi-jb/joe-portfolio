"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ContactButton from "../buttons/ContactButton";

const NAV_LINKS = [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Stack", href: "#stack" },
];

// Animated left->right strikethrough + colour shift on hover (see
// `.nav-link` in globals.css), shared by desktop and mobile links.
const navLinkClasses = "nav-link text-xl font-medium text-content";

// Alternate the per-item accent: blue, pink, blue, pink, ...
const accentByIndex = (i: number) =>
    i % 2 === 0 ? "nav-accent-blue" : "nav-accent-pink";

export default function Header() {
    const [open, setOpen] = useState(false);
    const [activeHref, setActiveHref] = useState<string | null>(null);

    // Scroll-spy: mark the section currently around the middle of the viewport
    // as active.
    useEffect(() => {
        const sections = NAV_LINKS.map((l) =>
            document.getElementById(l.href.slice(1))
        ).filter((el): el is HTMLElement => el !== null);
        if (sections.length === 0) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveHref("#" + entry.target.id);
                });
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );
        sections.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string
    ) => {
        e.preventDefault();
        setActiveHref(href);
        setOpen(false);
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setActiveHref(null);
        setOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const linkClass = (href: string, i: number, extra = "") =>
        `${navLinkClasses} ${extra} ${accentByIndex(i)} ${
            activeHref === href ? "is-active" : ""
        }`;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-hairline bg-surface/80 backdrop-blur transition-colors">
            <nav className="container flex items-center justify-between py-4">
                {/* Logo — back to the hero / top */}
                <a
                    href="#"
                    onClick={handleLogoClick}
                    className="shrink-0"
                    aria-label="Back to top"
                >
                    <Image
                        src="/assets/icons/joe-logo.png"
                        alt="Joe logo"
                        width={80}
                        height={80}
                        priority
                        className="object-cover rounded-[50%]"
                    />
                </a>

                {/* Desktop nav (centered) */}
                <ul className="hidden items-center gap-6 md:flex">
                    {NAV_LINKS.map((link, i) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={linkClass(link.href, i)}
                            >
                                {link.label}
                            </a>
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
                            <a
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={linkClass(link.href, i, "text-2xl")}
                            >
                                {link.label}
                            </a>
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
