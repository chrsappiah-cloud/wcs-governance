const LEGACY_ORIGIN =
  process.env.WCS_LEGACY_SITE_URL?.replace(/\/$/, "") ?? "https://worldclassscholars.vercel.app";

export type FeaturedResource = {
  slug: string;
  title: string;
  summary: string;
  category: string;
};

export async function getFeaturedResources(): Promise<FeaturedResource[]> {
  try {
    const res = await fetch(`${LEGACY_ORIGIN}/api/v1/resources/featured`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return (await res.json()) as FeaturedResource[];
  } catch {
    return [];
  }
}

export function legacyOrigin() {
  return LEGACY_ORIGIN;
}
