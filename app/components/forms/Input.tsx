import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
};

// forwardRef so react-hook-form's `register` can attach its ref.
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, id, name, className = "", ...props }, ref) => {
        const inputId = id ?? name;
        return (
            <div className={`flex flex-col gap-2 ${className}`}>
                <label
                    htmlFor={inputId}
                    className="font-mono text-sm uppercase tracking-wider text-muted"
                >
                    {label}
                </label>
                <input
                    id={inputId}
                    name={name}
                    ref={ref}
                    aria-invalid={error ? "true" : undefined}
                    className={`rounded-lg border bg-surface-card px-4 py-3 text-content outline-none transition-colors placeholder:text-muted/50 focus:border-accent-blue ${
                        error ? "border-accent-pink" : "border-hairline"
                    }`}
                    {...props}
                />
                {error && (
                    <span className="text-sm text-accent-pink">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
