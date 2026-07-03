type ContactButtonProps = {
    href?: string;
    label?: string;
    className?: string;
    newTab?: boolean;
    /** When set, renders a <button> with this type instead of a link. */
    type?: "submit" | "button";
    /** Disables the button (only applies when rendered as a <button>). */
    disabled?: boolean;
};

/**
 * CTA button with a glitch / RGB-split distortion on hover.
 * The effect is pure CSS (see `.glitch-link` / `.glitch` in globals.css):
 * two pseudo-elements clone the label via `data-text`, then jitter and
 * channel-split on hover. No JS, no runtime dependency.
 */
export default function ContactButton({
    href = "#contact",
    label = "Contact me",
    className = "",
    newTab = false,
    type,
    disabled = false,
}: ContactButtonProps) {
    const classes = `glitch-link relative inline-flex items-center justify-center overflow-hidden border border-accent-pink/50 bg-surface-card px-6 py-3 font-mono text-base font-medium uppercase tracking-widest text-accent-pink transition-colors hover:border-accent-pink hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-accent-pink/50 disabled:hover:bg-surface-card ${className}`;

    const inner = (
        <span data-text={label} className="glitch">
            {label}
        </span>
    );

    if (type) {
        return (
            <button type={type} className={classes} disabled={disabled}>
                {inner}
            </button>
        );
    }

    return (
        <a
            href={href}
            target={newTab ? "_blank" : undefined}
            rel={newTab ? "noopener noreferrer" : undefined}
            className={classes}
        >
            {inner}
        </a>
    );
}
