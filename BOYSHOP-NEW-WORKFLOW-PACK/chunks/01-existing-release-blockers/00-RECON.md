# C01.00 — Phase 01 reconnaissance (existing release blockers)

## Routing
Run `ROUTING-PREFLIGHT.md` immediately before this chunk. Consider every currently installed OMO agent; select the best fit for this chunk.

## Mode
READ ONLY. No code changes, no commit.

## Outcome
Establish the authoritative, evidence-backed release-blocker picture for `BS2Mod-site` before any implementation:
- the authoritative blocker queue (from repo truth — `docs/evidence/GO-LIVE.md`, `PROJECT-STATE.md`, `HANDOFF.md`, `CHANGELOG.md`, `MASTER-SPEC.md`, not from memory);
- remaining P0/P1 items and their dependencies;
- which blockers are already closed versus actually still open (verify against the live tree, not the docs);
- approval gates that gate each blocker.

## Inspect
1. The five evidence docs under `BS2Mod-site/docs/evidence/` for the recorded blocker list and release verdict.
2. `MASTER-SPEC.md` for stable product/acceptance truth.
3. The live repository for the actual state behind each blocker (files exist? tests pass? deploy config present?).
4. Any `.env` / `.dev.vars` / `wrangler.jsonc` / Mollie / DB configuration presence — WITHOUT echoing secrets.

## Output
Facts, gaps, acceptance criteria, dependencies, and approval gates. Do not implement anything.

## Out of scope
- Any code edit, commit, or deploy action.
- Phase 02+ recon.

## Permanent execution rules

- Execute exactly **one tiny chunk** per run.
- One chunk = one concern, one small directly related file group, one independently verifiable behavior.
- Before every chunk launches, run the mandatory **agent + model routing preflight** from `ROUTING-PREFLIGHT.md`.
- Consider **all currently installed OMO agents** before choosing the executor. Never assume the installed-agent set is unchanged.
- Agent choice and model choice are separate decisions.
- Never silently switch model/provider or broaden scope because a stronger agent/model exists.
- `NEXT.md` is the only current execution entry.
- Repository truth beats stale documentation.
- `MASTER-SPEC.md` is stable product truth.
- `CURRENT-STATE.md` is concise live repo truth.
- `IMPLEMENTATION-MAP.md` is the dynamic route map.
- Future implementation chunks are generated from repository evidence, not guessed in advance.
- Preserve the modular/no-code landing-to-checkout architecture.
- Preserve the current BoyShop design as the first reusable template.
- No test deletion or test weakening merely to get green.
- No broad release audit unless the active chunk specifically authorizes it.
- No live DB migration without CEO authorization.
- No `MOLLIE_ALLOW_LIVE=true` without CEO authorization.
- Never commit secrets.
- Never use `git add -A`.
- No `as any`, `@ts-ignore`, `@ts-expect-error`, or empty catch blocks.
- No new npm dependencies unless explicitly authorized by the active chunk.
- Never silently include unrelated visual work.
- Git add/commit/tag/push require explicit user approval unless already authorized for that exact scope.
- Implementation/verification happen first; project-documentation sync happens once at closeout where applicable.
- If unrelated issues appear, report `OUT OF SCOPE — NOT CHANGED`.
- Re-evaluate the remaining plan after every chunk; skip, split, insert, or reorder future chunks when repo evidence warrants it.
- Rewrite `NEXT.md` to exactly one next chunk, then STOP.

At closeout, point `NEXT.md` to this phase's `01-GENERATE-CHUNKS.md`.

## Required completion response

### Routing preflight
- Installed OMO agents considered: <all discovered agents>
- Primary agent: <selected agent>
- Supporting/reviewer agents: <none or selected>
- Recommended model: <current/default or recommended alternative>
- Sisyphus: <not needed / recommended>
- Routing reason: <concise>

### Chunk completed
Name the one chunk executed.

### Files changed
Exact files, or `none`.

### Verification
Exact commands/checks and results.

### Drift / blockers
Unexpected state, approval gates, and `OUT OF SCOPE — NOT CHANGED`.

### Project-state sync
Canonical project docs updated at closeout, or `none` with reason.

### Next tiny chunk
Exactly one next chunk.

### STOP
End with:

**STOP — no next chunk was started.**
