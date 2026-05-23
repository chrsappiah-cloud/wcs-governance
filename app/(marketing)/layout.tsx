export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem 2rem", borderBottom: "1px solid var(--border)" }}>
        <strong>World Class Scholars</strong>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/login">Staff login</a>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
