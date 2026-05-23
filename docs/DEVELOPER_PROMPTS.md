# Developer prompts — WCS governance

Use these prompts (with an AI assistant or directly in SQL/API calls) for consistent governance operations.

## Add a new manager with limited scope

> Assign this staff member as `content_manager` for `website-main` only. They should be able to publish website content but not manage access, releases, or finance. Insert a `user_role_assignments` row and verify via `user_has_permission_for_scope`.

```sql
select public.assign_role_for_scope(
  '<user-uuid>',
  'content_manager',
  'website-main',
  '<founder-uuid>'
);

select public.user_has_permission_for_scope('<user-uuid>', 'publish_content', 'website-main');
select public.user_has_permission_for_scope('<user-uuid>', 'manage_access', 'org-global');
```

## Log a new R&D experiment

> Create an `rd_evidence_records` entry for project `etherealveil-rd-2026` with type `experiment`, linking to commit `abc123`, build `1.2.0`, and summarizing the hypothesis, test, and result in under 150 words.

```sql
insert into public.rd_evidence_records (
  rd_project_id,
  evidence_type,
  title,
  summary,
  linked_commit,
  linked_build,
  recorded_by
)
select
  rp.id,
  'experiment',
  'Adaptive pacing A/B — session 12',
  'Hypothesis: slower reveal reduces cognitive load. Test: cohort B with 1.4x pacing. Result: completion +8%, no increase in abandonment.',
  'abc123',
  '1.2.0',
  auth.uid()
from public.rd_projects rp
join public.resource_scopes s on s.id = rp.scope_id
where s.key = 'etherealveil-rd-2026';
```

## Produce a monthly R&D evidence pack

> Query `rd_evidence_records` for project `wcs-platform-rd-2026` for the past month, grouped by `evidence_type`, and output a markdown/PDF-ready summary including experiment titles, key results, and linked cost refs.

Use the console API route:

```bash
curl -X POST https://your-console.vercel.app/api/export-rd-pack \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"scope_key":"wcs-platform-rd-2026","since":"2026-04-01"}'
```

Create evidence via API:

```bash
curl -X POST https://your-console.vercel.app/api/rd-evidence \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{
    "rd_project_id": 1,
    "evidence_type": "experiment",
    "title": "Adaptive pacing A/B — session 12",
    "summary": "Hypothesis: slower reveal reduces cognitive load.",
    "linked_commit": "abc123",
    "linked_build": "1.2.0"
  }'
```

Or use the **Log evidence** form on `/rd-projects` (server action `createRDEvidence` → RLS + audit trigger).

View structured monthly packs at `/rd-projects/monthly?scope=wcs-platform-rd-2026&year=2026&month=5` (server action `exportMonthlyRDEvidence`).

Or SQL:

```sql
select evidence_type, title, summary, linked_commit, linked_build, linked_cost_ref, recorded_at
from public.rd_evidence_records e
join public.rd_projects rp on rp.id = e.rd_project_id
join public.resource_scopes s on s.id = rp.scope_id
where s.key = 'wcs-platform-rd-2026'
  and e.recorded_at >= now() - interval '1 month'
order by evidence_type, recorded_at desc;
```

## Founder bootstrap (first run)

1. Sign up at `/login` with your founder email.
2. Run `supabase/seed-founder.sql` in the Supabase SQL editor (replace `YOUR_FOUNDER_EMAIL` if needed).
3. Sign out and back in so JWT claims refresh (`is_staff`, `org_role`, `founder_access`).
4. Enable **Custom Access Token Hook** in Supabase Dashboard → Auth → Hooks → `public.custom_access_token_hook`.

These workflows align with Australian R&D record-keeping expectations: contemporaneous, linkable evidence tied to scoped permissions.
