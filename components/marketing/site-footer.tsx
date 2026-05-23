import Link from "next/link";
import { founderProfile, siteNav, socialChannels } from "@/lib/marketing/config";

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M10 42 32 10l22 32" />
      <path d="M18 42h28" />
      <circle cx="32" cy="26" r="5" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <BrandMark />
            <span>World Class Scholars</span>
          </div>
          <p className="small">{founderProfile.bio}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
            <img src={founderProfile.avatar} alt={founderProfile.name} className="footer-avatar" />
            <div>
              <a href={`mailto:${founderProfile.email}`} className="accent-link small">
                {founderProfile.email}
              </a>
              <br />
              <a href={founderProfile.profileUrl} target="_blank" rel="noopener noreferrer" className="accent-link small">
                christopherappiahthompson.link
              </a>
            </div>
          </div>
          <p className="small" style={{ marginTop: 16 }}>
            Governance console: <Link href="/login" className="accent-link">Staff sign-in</Link>
            {" · "}
            <Link href="/system" className="accent-link">System diagnostics</Link>
          </p>
        </div>

        <div>
          <h3 className="footer-col-heading">Explore</h3>
          <ul className="footer-col-list">
            {siteNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="footer-col-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="footer-col-heading">Connect</h3>
          <ul className="footer-col-list">
            {socialChannels.map((channel) => (
              <li key={channel.url}>
                <a href={channel.url} target="_blank" rel="noopener noreferrer" className="footer-col-link">
                  {channel.label} — {channel.handle}
                </a>
              </li>
            ))}
            <li>
              <Link href="/marketing?tab=testflight" className="footer-col-link">
                TestFlight beta data
              </Link>
            </li>
            <li>
              <Link href="/marketing?tab=app-store" className="footer-col-link">
                App Store purchase
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
