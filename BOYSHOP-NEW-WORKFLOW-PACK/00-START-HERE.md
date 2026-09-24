# BoyShop / BS2Mod — Agent-Aware Tiny-Chunk Workflow Pack

## Exact product flow

**Repo stabilization → existing release blockers → inventory → builder reconnaissance → builder foundation → branding → navigation → pages → sections → BoyShop template → catalog → cart → checkout → setup wizard → draft/preview/publish → Superadmin → providers → deployment wizard → security → QA → no-code acceptance → release audit → production → go-live → post-launch.**

Each item is its own phase.

## Live control files

1. `MASTER-SPEC.md` — stable product truth.
2. `CURRENT-STATE.md` — current repository truth.
3. `IMPLEMENTATION-MAP.md` — dynamic phase/chunk route map.
4. `NEXT.md` — exactly one current execution entry.
5. `AGENT-ROUTING.md` — how to select among all installed OMO agents.
6. `MODEL-ROUTING.md` — model/mode guidance.
7. `ROUTING-PREFLIGHT.md` — mandatory gate before every chunk.

## Dynamic behavior

Every chunk launch follows:

**read NEXT → discover all installed OMO agents → route agent/model → execute one chunk → verify → re-evaluate future plan → sync state/map/docs once → rewrite NEXT → STOP**

Later phase implementation prompts are not guessed today. Each phase begins with read-only reconnaissance and then generates the actual tiny chunks based on the repo state at that time.

## First action

Place this pack at:

`C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK`

Then use `TRIGGER-PROMPT.md`.


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
