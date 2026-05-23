# iOS and SwiftUI clients — shared Supabase governance

All World Class Scholars iOS apps should use the **same Supabase project** as [wcs-governance](https://github.com/chrsappiah-cloud/wcs-governance). Do not duplicate permission logic in Swift — rely on RLS and scoped APIs.

## Repositories

| App | Repository | Notes |
|-----|------------|-------|
| Ethereal Veil | [EtherealVeil](https://github.com/chrsappiah-cloud/EtherealVeil) | Therapeutic drawing — R&D scope `etherealveil-rd-2026` |
| WCSLiB | [WCSLIB](https://github.com/chrsappiah-cloud/WCSLIB) | iOS scope `wcslib-ios` |
| WCS Platform | [WCS-Platform-v2](https://github.com/chrsappiah-cloud/WCS-Platform-v2) | Lesson video pipeline |
| WCS GEO | [WCS-GEO](https://github.com/chrsappiah-cloud/WCS-GEO) | Already uses Supabase — align auth with governance project |
| Scholars Gallery | [ScholarsGallery](https://github.com/chrsappiah-cloud/ScholarsGallery) | SwiftUI + CloudKit — internal ops via governance APIs |
| WCS BIM | [WCS-BIM](https://github.com/chrsappiah-cloud/WCS-BIM) | Field workspace |

## SwiftUI integration pattern

1. Sign in with Supabase Auth (same project as web console).
2. Read JWT claims (`is_staff`, `org_role`) for coarse UI gating only.
3. Call Postgres tables or Edge Functions — **RLS enforces access**.
4. Internal-only screens: approval queue, release status, quick R&D note capture.

## Apple App Store Connect

Founder remains **Account Holder**. Other team members get narrow roles (Admin, App Manager, Developer, Marketing, Finance, Customer Support) — mapped to governance roles in [role-matrix.md](./role-matrix.md).
