import { aboutPillars, founderProfile, socialChannels } from "@/lib/marketing/config";

export default function AboutPage() {
  return (
    <section className="section">
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
