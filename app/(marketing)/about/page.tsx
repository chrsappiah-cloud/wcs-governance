import type { Metadata } from "next";
import { aboutPillars, founderProfile, socialChannels } from "@/lib/marketing/config";

export const metadata: Metadata = {
  title: "About — World Class Scholars | Dr Christopher Appiah-Thompson",
  description:
    "Learn about World Class Scholars — global consultancy in disability, mental health, and dementia care. Meet founder Dr Christopher Appiah-Thompson and explore our pillars: consultancy, education, and creative media.",
  openGraph: {
    title: "About World Class Scholars — Dr Christopher Appiah-Thompson",
    description:
      "Consultancy, education, and creative media for equity, dignity, and social justice in disability, mental health, and dementia care.",
    url: "/about",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dr Christopher Appiah-Thompson",
  jobTitle: "Founder, World Class Scholars",
  url: "https://christopherappiahthompson.link",
  image: "https://0.gravatar.com/avatar/d8bd3742b066b58641607204c431fb47b6b32016887ba1a7b95e91279d7562d3?size=512",
  email: "christopher.appiahthompson@myworldclass.org",
  sameAs: [
    "https://www.linkedin.com/in/christopher-appiah-thompson-a2014045",
    "https://tiktok.com/@chrsappiah",
    "https://www.youtube.com/channel/UC2a-_QUygsGAKWzEdKHEP9Q",
  ],
};

export default function AboutPage() {
  return (
    <section className="section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="container narrow">
        <div className="section-head">
          <h1>About World Class Scholars</h1>
          <p className="lede">{founderProfile.bio}</p>
        </div>

        <div className="pillars">
          {aboutPillars.map((pillar) => (
            <article key={pillar.title} className="card pillar-card">
              <div className="card-kicker">Pillar</div>
              <h2 className="card-title">{pillar.title}</h2>
              <p className="card-body">{pillar.description}</p>
            </article>
          ))}
        </div>

        <div className="founder-section block">
          <div className="founder-header">
            <img src={founderProfile.avatar} alt={founderProfile.name} className="founder-avatar" />
            <div>
              <h2 className="founder-name">{founderProfile.name}</h2>
              <p className="muted small">
                {founderProfile.location} —{" "}
                <a href={`mailto:${founderProfile.email}`} className="accent-link">
                  {founderProfile.email}
                </a>
              </p>
            </div>
          </div>
          <p className="founder-bio">{founderProfile.bio}</p>
          <div className="founder-block">
            <h3 className="sub-heading">Social</h3>
            <div className="social-links">
              {socialChannels.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="social-chip">
                  <span className="social-label">{s.label}</span>
                  <span className="social-handle">{s.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
