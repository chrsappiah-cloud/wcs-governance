import Link from "next/link";
import { founderProfile, iosApps, podcasts, socialChannels } from "@/lib/marketing/config";
import { getFeaturedResources } from "@/lib/marketing/legacy-api";

export default async function HomePage() {
  const featured = await getFeaturedResources();

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Dr Christopher Appiah-Thompson · Australia</span>
            <h1>World Class Scholars</h1>
            <p>
              Equity, dignity, and social justice in disability, mental health, and dementia care —
              through consultancy, courses, digital art, podcasts, and iOS apps you can try on TestFlight today.
            </p>
            <div className="hero-actions">
              <Link className="btn primary" href="/marketing">
                iOS apps &amp; App Store
              </Link>
              <Link className="btn" href="/library">
                Search the library
              </Link>
              <Link className="btn" href="/about">
                About Christopher
              </Link>
              <Link className="btn" href="/login">
                Staff console
              </Link>
            </div>
            <div className="kpis">
              <div className="card kpi">
                <strong>{iosApps.length}</strong>
                <span className="small">promotional iOS apps</span>
              </div>
              <div className="card kpi">
                <strong>{podcasts.length}</strong>
                <span className="small">podcasts on RSS</span>
              </div>
              <div className="card kpi">
                <strong>@chrsappiah</strong>
                <span className="small">TikTok · LinkedIn · YouTube</span>
              </div>
            </div>
          </div>

          <aside className="card founder-card">
            <img src={founderProfile.avatar} alt={founderProfile.name} className="founder-card-avatar" />
            <h3>{founderProfile.name}</h3>
            <p className="small">{founderProfile.title}</p>
            <p className="small">{founderProfile.bio}</p>
            <a href={founderProfile.profileUrl} target="_blank" rel="noopener noreferrer" className="accent-link small">
              christopherappiahthompson.link
            </a>
            <a href={`mailto:${founderProfile.email}`} className="accent-link small" style={{ display: "block", marginTop: 8 }}>
              {founderProfile.email}
            </a>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Connect with Christopher</h2>
          </div>
          <div className="social-links" style={{ marginBottom: 24 }}>
            {socialChannels.map((channel) => (
              <a key={channel.url} href={channel.url} target="_blank" rel="noopener noreferrer" className="social-chip">
                <span className="social-label">{channel.label}</span>
                <span className="social-handle">{channel.handle}</span>
              </a>
            ))}
          </div>
          <div className="grid-3">
            <Link href="/marketing?tab=testflight" className="card feature">
              <h3>TestFlight betas</h3>
              <p>Download beta manifest JSON and join public invite links for WCS Care and Gold Test.</p>
            </Link>
            <Link href="/marketing?tab=app-store" className="card feature">
              <h3>App Store purchases</h3>
              <p>Premium monthly, AI tutor packs, and exam unlocks via StoreKit and Apple Server API.</p>
            </Link>
            <Link href="/courses" className="card feature">
              <h3>Courses &amp; micro-credentials</h3>
              <p>Workshops and learning pathways for care and community services leaders.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured resources</h2>
            <p>Curated toolkit pages from the WCS library.</p>
          </div>
          {featured.length === 0 ? (
            <p className="alert">Could not load resources. Library API may be offline.</p>
          ) : (
            <div className="list">
              {featured.map((item) => (
                <Link key={item.slug} className="result result-link" href={`/resources/${item.slug}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <p className="small">{item.summary}</p>
                  </div>
                  <span className="pill">{item.category}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section founder-home-section">
        <div className="container">
          <div className="grid-2">
            <div className="card">
              <span className="tag">What I do</span>
              <h3>Consultancy, education &amp; creative media</h3>
              <p>Policy and co-design for government and NGOs; online courses for care workers; ethical brand campaigns; digital art and podcasts.</p>
              <Link href="/about" className="btn" style={{ marginTop: 16 }}>
                Full profile →
              </Link>
            </div>
            <div className="card">
              <span className="tag">Listen</span>
              <h3>Podcasts</h3>
              <ul className="podcast-list">
                {podcasts.map((pod) => (
                  <li key={pod.url}>
                    <a href={pod.url} target="_blank" rel="noopener noreferrer" className="accent-link">
                      {pod.label}
                    </a>
                  </li>
                ))}
              </ul>
              <a href="https://paypal.me/christopherappiahthompson" target="_blank" rel="noopener noreferrer" className="btn primary" style={{ marginTop: 16 }}>
                Support via PayPal
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
