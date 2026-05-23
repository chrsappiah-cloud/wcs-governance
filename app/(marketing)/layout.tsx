import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import "./marketing.css";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
