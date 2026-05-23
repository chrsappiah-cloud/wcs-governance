import { requirePermission } from "@/lib/auth/require-permission";

export default async function IosReleasesPage() {
  await requirePermission("manage_release", "etherealveil-ios");
  return (
    <section>
      <h1>iOS Releases</h1>
      <p className="muted">TestFlight, metadata, and release checklist for EtherealVeil iOS.</p>
    </section>
  );
}
