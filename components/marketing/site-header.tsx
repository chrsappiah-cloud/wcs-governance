"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNav } from "@/lib/marketing/config";

function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M10 42 32 10l22 32" />
      <path d="M18 42h28" />
      <circle cx="32" cy="26" r="5" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  function toggleTheme() {
    const html = document.documentElement;
    html.setAttribute("data-theme", html.getAttribute("data-theme") === "dark" ? "light" : "dark");
  }

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link className="brand" href="/" aria-label="World Class Scholars home">
          <BrandMark />
          <span>World Class Scholars</span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {siteNav.map((item) => (
            <Link
              key={item.href}
              className={`nav-link${pathname === item.href ? " router-link-active" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link className="nav-link staff-link" href="/login">
            Staff
          </Link>
        </nav>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button type="button" className="btn" onClick={toggleTheme} aria-label="Switch theme">
            Theme
          </button>
          <Link className="btn primary" href="/login">
            Staff console
          </Link>
        </div>
      </div>
    </header>
  );
}
