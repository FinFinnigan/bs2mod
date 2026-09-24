# IMPLEMENTATION-MAP — BoyShop / BS2Mod

Statuses: `QUEUED`, `ACTIVE`, `BLOCKED`, `READY-FOR-ACCEPTANCE`, `DONE`, `SKIPPED-AS-ALREADY-SATISFIED`.

| Phase | Workstream | Status | Folder | Exit intent |
|---:|---|---|---|---|
| 00 | Repo stabilization | ACTIVE | `repo-stabilization` | Make repository truth, metadata, docs, evidence and Git scope trustworthy. |
| 01 | Existing release blockers | QUEUED | `existing-release-blockers` | Reconcile and close the authoritative current release blockers in dependency order. |
| 02 | Inventory | QUEUED | `inventory` | Close the stock/inventory acceptance requirement safely. |

Repo evidence 2026-09-24 (C00.4): C00.4 stale-paperwork audit COMPLETE — repo-model change found (BS2Mod-site now owns its own git repo, HEAD `988f7f4`), synchronized C01.06–C01.10 decision records are committed there, and `.env.local` now exists (Mollie doc stale). C02 inventory work and Miski2/Miski3 theme commits already exist in history (`59a6bb4`, `5c86e1d`, `bbfa6af`, `7fa927c`, `988f7f4`); HANDOFF/PROJECT-STATE are reference-for-shape only. Phase 00 continues with C00.5 Mollie paperwork next.
| 03 | Builder reconnaissance | QUEUED | `builder-reconnaissance` | Map the actual repo before no-code builder implementation. |
| 04 | Builder foundation | QUEUED | `builder-foundation` | Create shared site configuration, persistence and template foundations. |
| 05 | Branding | QUEUED | `branding` | Make supported branding/theme controls no-code. |
| 06 | Navigation | QUEUED | `navigation` | Make supported navigation structures no-code. |
| 07 | Pages | QUEUED | `pages` | Create managed pages, routing and metadata within the builder model. |
| 08 | Sections | QUEUED | `sections` | Create reusable registered section modules with safe schemas. |
| 09 | BoyShop template | QUEUED | `boyshop-template` | Preserve and reproduce the approved BoyShop design as template #1. |
| 10 | Catalog | QUEUED | `catalog` | Make supported catalog presentation modular/configurable. |
| 11 | Cart | QUEUED | `cart` | Make supported cart presentation modular while protecting commerce logic. |
| 12 | Checkout | QUEUED | `checkout` | Extend safe no-code configuration through checkout/confirmation. |
| 13 | Setup wizard | QUEUED | `setup-wizard` | Build the Superadmin setup wizard on the shared configuration model. |
| 14 | Draft / preview / publish | QUEUED | `draft-preview-publish` | Provide safe draft editing, preview and intentional publishing. |
| 15 | Superadmin | QUEUED | `superadmin` | Unify website and commerce controls into a coherent non-technical admin. |
| 16 | Providers | QUEUED | `providers` | Verify/implement provider-neutral boundaries required by the product. |
| 17 | Deployment wizard | QUEUED | `deployment-wizard` | Guide safe environment/domain/provider/deployment setup. |
| 18 | Security | QUEUED | `security` | Harden builder, admin and commerce surfaces. |
| 19 | QA | QUEUED | `qa` | Verify visitor/customer/admin/Superadmin flows and regressions. |
| 20 | No-code acceptance | QUEUED | `no-code-acceptance` | Prove supported landing-to-checkout setup requires no source-code edits. |
| 21 | Release audit | QUEUED | `release-audit` | Run the authoritative broad release audit when justified. |
| 22 | Production | QUEUED | `production` | Prepare production systems under approval gates. |
| 23 | Go-live | QUEUED | `go-live` | Perform authorized release and production smoke tests. |
| 24 | Post-launch | QUEUED | `post-launch` | Validate live operations and capture follow-up work. |

## Dynamic rule

When a phase becomes active:
1. run its `00-RECON.md`;
2. route across all installed OMO agents before launching it;
3. run `01-GENERATE-CHUNKS.md`;
4. generate only needed tiny prompts under `chunks/<phase>/`;
5. execute them one by one through `NEXT.md`;
6. run `99-ACCEPTANCE.md`;
7. mark phase DONE only with evidence;
8. activate the next phase.

After every chunk, re-evaluate whether future prompts should be skipped, split, inserted, reordered, or rewritten.
