import type { Metadata } from "next";
import "./globals.css";

const title = "World Class Scholars — Dr Christopher Appiah-Thompson";
const description =
  "World Class Scholars — global consultancy in disability, mental health and dementia care. Courses, library, TestFlight iOS apps, and App Store subscriptions by Dr Christopher Appiah-Thompson, Australia.";
const siteUrl = "https://worldclassscholars.vercel.app";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "World Class Scholars",
    "Christopher Appiah-Thompson",
    "dementia care",
    "disability consultancy",
    "aged care quality",
    "TestFlight iOS apps",
    "App Store subscriptions",
    "AI tutoring care workers",
    "CHC qualification",
    "HLT training",
    "dementia care app",
    "aged care assessment",
    "micro-credentials care sector",
    "disability support Australia",
    "mental health consultancy",
    "social justice disability",
    "humane care",
    "Australia",
    "RSS podcasts",
    "care workforce training",
  ],
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "World Class Scholars",
    locale: "en_AU",
    type: "website",
    title,
    description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  verification: {
    google: "google-site-verification-code",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "World Class Scholars",
      url: siteUrl,
      logo: "https://0.gravatar.com/avatar/d8bd3742b066b58641607204c431fb47b6b32016887ba1a7b95e91279d7562d3?size=512",
      description: "Global consultancy in disability, mental health and dementia care.",
      founder: {
        "@type": "Person",
        name: "Dr Christopher Appiah-Thompson",
        email: "christopher.appiahthompson@myworldclass.org",
        url: "https://christopherappiahthompson.link",
      },
      sameAs: [
        "https://www.linkedin.com/in/christopher-appiah-thompson-a2014045",
        "https://tiktok.com/@chrsappiah",
        "https://www.youtube.com/channel/UC2a-_QUygsGAKWzEdKHEP9Q",
        "https://christopherappiahthompson.link",
      ],
    },
    {
      "@type": "WebSite",
      name: "World Class Scholars",
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/library?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
