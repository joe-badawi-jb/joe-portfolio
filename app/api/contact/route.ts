import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Where owner notifications land. The visitor's own address is read from the
// form payload so we can also send them a confirmation.
const OWNER_EMAIL = "joebadawi9@gmail.com";

type ContactPayload = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    message?: string;
};

const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
    let body: ContactPayload;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: "Invalid request body" },
            { status: 400 }
        );
    }

    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName || !email || !phone || !message) {
        return NextResponse.json(
            { message: "All fields are required" },
            { status: 400 }
        );
    }
    if (!isValidEmail(email)) {
        return NextResponse.json(
            { message: "Please provide a valid email address" },
            { status: 400 }
        );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Missing EMAIL_USER / EMAIL_PASS environment variables");
        return NextResponse.json(
            { message: "Email service is not configured" },
            { status: 500 }
        );
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Notification to the owner about the new submission.
    const ownerMail = {
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to: OWNER_EMAIL,
        replyTo: email,
        subject: `New contact form submission from ${fullName}`,
        text: `Someone filled out your portfolio contact form.\n\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
        html: `
            <p>Someone filled out your portfolio contact form.</p>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
        `,
    };

    // Confirmation to the visitor who submitted the form.
    const visitorMail = {
        from: `"Joe Badawi" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Thanks for reaching out!",
        text: `Hi ${firstName},\n\nThanks for getting in touch — I've received your message and will get back to you as soon as possible.\n\nFor reference, here is what you sent:\n${message}\n\nBest,\nJoe Badawi`,
        html: `
            <p>Hi ${firstName},</p>
            <p>Thanks for getting in touch — I've received your message and will get back to you as soon as possible.</p>
            <p>For reference, here is what you sent:</p>
            <blockquote>${message.replace(/\n/g, "<br/>")}</blockquote>
            <p>Best,<br/>Joe Badawi</p>
        `,
    };

    try {
        await transporter.verify();
        await Promise.all([
            transporter.sendMail(ownerMail),
            transporter.sendMail(visitorMail),
        ]);
        return NextResponse.json({ message: "Email sent successfully!" });
    } catch (error) {
        // Log the full error server-side and echo the message back so it is
        // visible in the browser's network tab while debugging.
        console.error("Contact form email error:", error);
        const detail =
            error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { message: "Error sending email", error: detail },
            { status: 500 }
        );
    }
}
