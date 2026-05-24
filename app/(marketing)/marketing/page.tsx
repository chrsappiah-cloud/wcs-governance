import type { Metadata } from "next";
import { iosApps, socialChannels } from "@/lib/marketing/config";

export const metadata: Metadata = {
  title: "iOS Apps & App Store — World Class Scholars",
  description:
    "Download WCS Care, WCS Gold Test, WCS Agentic, and WCS Commerce on the App Store via TestFlight beta or live subscriptions. Dementia care, aged care assessment, AI tutoring, and commerce tools by Dr Christopher Appiah-Thompson.",
  openGraph: {
    title: "iOS Apps & App Store — World Class Scholars",
    description:
      "TestFlight beta invites and App Store subscriptions for dementia care, aged care quality assessment, AI tutoring, and commerce management.",
    url: "/marketing",
  },
};

function AppIcon({ name }: { name: string }) {
  const initial = name.replace("WCS ", "").charAt(0);
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <rect width="60" height="60" rx="14" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1" />
      <text x="30" y="36" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--accent)" fontFamily="Inter, sans-serif">
        {initial}
      </text>
    </svg>
  );
}

const appsJsonLd = {
  "@context": "https://schema.org",
  "@graph": iosApps.map((app) => ({
    "@type": "SoftwareApplication",
    name: app.name,
    description: app.description,
    applicationCategory: "HealthApplication",
    operatingSystem: "iOS",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "AUD",
    },
  })),
};

export default function MarketingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appsJsonLd) }}
      />
      <section className="section marketing-hero">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">App Store &middot; TestFlight</span>
            <h1>iOS apps</h1>
            <p className="lede">
              Try WCS apps on TestFlight or subscribe on the App Store. Dementia care, aged care quality assessment,
              AI-powered tutoring, and commerce tools — built for carers, providers, and learners.
            </p>
          </div>

          <div className="marketing-app-grid">
            {iosApps.map((app) => (
              <article key={app.slug} className="card marketing-app-card">
                <div className="marketing-app-accent" style={{ background: app.accent }} />
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <AppIcon name={app.name} />
                  <div>
                    <h3 style={{ margin: 0 }}>{app.name}</h3>
                    <p className="small" style={{ margin: 0 }}>{app.subtitle}</p>
                  </div>
                </div>
                <p className="small">{app.description}</p>
                <ul className="marketing-feature-list">
                  {app.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div className="marketing-app-actions">
                  <span className="tag" style={{ background: `${app.accent}22`, color: app.accent }}>
                    {app.category === "care" && "Dementia & disability"}
                    {app.category === "assessment" && "Aged care quality"}
                    {app.category === "learning" && "AI tutoring"}
                    {app.category === "utility" && "Commerce"}
                  </span>
                  <a
                    href={`https://apps.apple.com/app/${app.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn primary"
                    style={{ marginLeft: "auto" }}
                  >
                    App Store
                  </a>
                  <a
                    href={`https://testflight.apple.com/join/${app.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    TestFlight
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>How it works</h2>
          </div>
          <div className="grid-3">
            <div className="card">
              <span className="tag">1</span>
              <h3>Install TestFlight</h3>
              <p className="small">
                Download Apple&apos;s TestFlight app from the App Store, then tap the TestFlight link for any WCS app to join the beta.
              </p>
            </div>
            <div className="card">
              <span className="tag">2</span>
              <h3>Try before you buy</h3>
              <p className="small">
                Beta builds include most features free. Leave feedback directly through TestFlight to shape the next release.
              </p>
            </div>
            <div className="card">
              <span className="tag">3</span>
              <h3>Subscribe on the App Store</h3>
              <p className="small">
                Premium monthly subscriptions, AI tutor packs, and exam unlocks via StoreKit. Receipts validated server-side.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Support &amp; contact</h2>
          </div>
          <div className="grid-2">
            <div className="card">
              <h3>Get help</h3>
              <p className="small">
                For App Store purchase issues, subscription management, or beta feedback, email{" "}
                <a href="mailto:support@myworldclass.org" className="accent-link">
                  support@myworldclass.org
                </a>
              </p>
              <a href="mailto:support@myworldclass.org" className="btn" style={{ marginTop: 12 }}>
                Email support
              </a>
            </div>
            <div className="card">
              <h3>Follow development</h3>
              <p className="small">Release notes, roadmap, and changelog for all WCS iOS apps.</p>
              <div className="social-links" style={{ marginTop: 12 }}>
                {socialChannels.slice(0, 3).map((ch) => (
                  <a key={ch.url} href={ch.url} target="_blank" rel="noopener noreferrer" className="social-chip">
                    <span className="social-label">{ch.label}</span>
                    <span className="social-handle">{ch.handle}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
