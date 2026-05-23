import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Class Scholars — Dr Christopher Appiah-Thompson",
  description:
    "World Class Scholars — global consultancy in disability, mental health and dementia care. Courses, library, TestFlight iOS apps, and App Store subscriptions by Dr Christopher Appiah-Thompson, Australia.",
  metadataBase: new URL("https://worldclassscholars.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "World Class Scholars",
    locale: "en_AU",
    type: "website",
  },
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
      </head>
      <body>{children}</body>
    </html>
  );
}
