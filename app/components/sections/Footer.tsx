import Image from "next/image";

// Social links shown on the right of the footer. Icons live under
// /public/assets/icons and are dark-filled, so they sit inside a light chip
// (see below) to stay legible in either theme.
const SOCIALS = [
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/joe-badawi/",
        icon: "/assets/icons/linkedin.svg",
    },
    {
        label: "GitHub",
        href: "https://github.com/joe-badawi-jb",
        icon: "/assets/icons/github.svg",
    },
    {
        label: "Email",
        href: "mailto:joebadawi9@gmail.com",
        icon: "/assets/icons/email.svg",
    },
    {
        label: "Instagram",
        href: "https://www.instagram.com/joebadawi17/",
        icon: "/assets/icons/instagram.svg",
    },
    {
        label: "WhatsApp",
        href: "https://wa.me/96171240020",
        icon: "/assets/icons/whatsapp.svg",
    },

];

export default function Footer() {
    return (
        <footer className="relative z-10 border-t border-hairline bg-surface transition-colors">
            <div className="container flex flex-col items-center justify-between gap-8 pt-10 pb-2 sm:flex-row">
                {/* Logo — left */}
                <a href="#" aria-label="Back to top" className="shrink-0">
                    <Image
                        src="/assets/icons/joe-logo.png"
                        alt="Joe logo"
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                    />
                </a>

                {/* Social links — right */}
                <ul className="flex flex-wrap items-center justify-center gap-4">
                    {SOCIALS.map((social) => (
                        <li key={social.label}>
                            <a
                                href={social.href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={social.label}
                                title={social.label}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-white ring-1 ring-hairline transition-transform hover:-translate-y-1 hover:ring-2 hover:ring-accent-pink"
                            >
                                <Image
                                    src={social.icon}
                                    alt={social.label}
                                    width={22}
                                    height={22}
                                    className="h-[22px] w-[22px]"
                                />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Signature — centered below the logo/socials row */}
            <div className="container flex flex-col items-center gap-1 pb-8 text-center">
                <p className="text-base font-semibold tracking-tight text-content">
                    Joe El Badawi
                </p>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                    Software Engineer
                </p>
            </div>
        </footer>
    );
}
