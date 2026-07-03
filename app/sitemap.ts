import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joebadawi.com";

// Public, indexable pages. (The /testing scratch page is intentionally omitted.)
export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    return [
        {
            url: `${siteUrl}/`,
            lastModified,
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: `${siteUrl}/hobbies`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.8,
        },
    ];
}
