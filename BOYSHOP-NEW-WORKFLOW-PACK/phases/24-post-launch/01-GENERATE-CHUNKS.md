# Phase 24 — Post-launch — Generate tiny chunks

## Routing
Run `ROUTING-PREFLIGHT.md` first.

## Outcome
Generate only the implementation prompts actually required by completed reconnaissance.

Destination:
`chunks/24-post-launch/`

Every generated chunk must:
- have one concern;
- use a small directly related file group;
- define success + targeted verification;
- preserve approval gates;
- contain `Routing: run mandatory agent-aware preflight before execution`;
- avoid permanently hardcoding a named agent;
- optionally state a capability preference (exploration/implementation/architecture/security/QA);
- allow launch-time routing to select from all agents then installed;
- STOP after completion.

Update the map and set `NEXT.md` to the first generated chunk.
Do not execute it.


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
