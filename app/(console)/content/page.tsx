import { requirePermission } from "@/lib/auth/requirePermission";

export default async function ContentPage() {
  await requirePermission("publish_content", "website-main");
  return (
    <section>
      <h1>Website Content</h1>
      <p className="muted">Announcements, UI copy, media, and publication workflows for website-main.</p>
    </section>
  );
}
