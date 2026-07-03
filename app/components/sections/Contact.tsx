"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Input from "@/app/components/forms/Input";
import Textarea from "@/app/components/forms/Textarea";
import Modal from "@/app/components/ui/Modal";
import ContactButton from "@/app/components/buttons/ContactButton";

type FormValues = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
};

export default function Contact() {
    const root = useRef<HTMLElement>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>();

    // POST the form to the contact API (which emails both the owner and the
    // visitor via nodemailer). On success show the confirmation modal.
    const {
        mutate: sendMessage,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationFn: async (values: FormValues) => {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(
                    data?.error ?? data?.message ?? "Failed to send message"
                );
            }
            return res.json();
        },
        onSuccess: () => {
            setModalOpen(true);
            reset();
        },
        onError: (err) => {
            console.error("Contact form submit failed:", err);
        },
    });

    // Theme: dark when this section covers the viewport, light when scrolling
    // up into the (light) stack section. Only acts near its own boundary.
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        let dark = false;
        let raf = 0;
        const update = () => {
            raf = 0;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            if (rect.top > vh * 1.5) return;
            const nextDark = rect.top <= vh * 0.5;
            if (nextDark !== dark) {
                dark = nextDark;
                document.documentElement.classList.toggle(
                    "theme-light",
                    !dark
                );
            }
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    const onSubmit = (values: FormValues) => sendMessage(values);

    return (
        <section
            id="contact"
            ref={root}
            className="relative z-10 min-h-screen bg-surface transition-colors"
        >
            <div className="container py-20 md:py-28">
                <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-blue md:text-base">
                    {"// contact"}
                </p>
                <h2 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl xl:text-8xl">
                    Get in touch
                </h2>
                <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted md:text-2xl">
                    Have a product to build, a team to strengthen, or an idea that
                    needs shipping? I partner with founders and teams to turn
                    ambitious concepts into polished, production-ready software.
                    Tell me about your project and I will get back to you.
                </p>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2"
                >
                    <Input
                        label="First Name"
                        autoComplete="given-name"
                        error={errors.firstName?.message}
                        {...register("firstName", {
                            required: "First name is required",
                        })}
                    />
                    <Input
                        label="Last Name"
                        autoComplete="family-name"
                        error={errors.lastName?.message}
                        {...register("lastName", {
                            required: "Last name is required",
                        })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Enter a valid email",
                            },
                        })}
                    />
                    <Input
                        label="Phone number"
                        type="tel"
                        autoComplete="tel"
                        error={errors.phone?.message}
                        {...register("phone", {
                            required: "Phone number is required",
                        })}
                    />
                    <Textarea
                        label="Message"
                        rows={5}
                        className="sm:col-span-2"
                        error={errors.message?.message}
                        {...register("message", {
                            required: "Message is required",
                        })}
                    />
                    <div className="sm:col-span-2">
                        <ContactButton
                            type="submit"
                            label={isPending ? "Sending..." : "Send message"}
                            disabled={isPending}
                        />
                        {isError && (
                            <p className="mt-4 text-sm text-accent-pink">
                                {error instanceof Error
                                    ? error.message
                                    : "Something went wrong while sending your message. Please try again."}
                            </p>
                        )}
                    </div>
                </form>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-blue/15 text-accent-blue">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-7 w-7"
                            aria-hidden
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-content">
                        Message received
                    </h3>
                    <p className="mt-3 text-muted">
                        Thanks for reaching out — I will get back to you as soon as
                        possible.
                    </p>
                    <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="mt-6 rounded-full border-2 border-accent-pink px-6 py-2 text-sm font-semibold uppercase tracking-widest text-accent-pink transition-colors hover:bg-accent-pink hover:text-white"
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </section>
    );
}
