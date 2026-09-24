# WORKFLOW-RULES


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


## Control files

- `MASTER-SPEC.md`: stable product truth.
- `CURRENT-STATE.md`: concise current repo truth.
- `IMPLEMENTATION-MAP.md`: dynamic roadmap/status.
- `NEXT.md`: exactly one active chunk.
- `AGENT-ROUTING.md`: agent selection rules.
- `MODEL-ROUTING.md`: model/escalation rules.
- `ROUTING-PREFLIGHT.md`: mandatory pre-execution routing gate.

## Closeout

After implementation + verification:
1. update applicable canonical project docs once;
2. update `CURRENT-STATE.md`;
3. update `IMPLEMENTATION-MAP.md`;
4. create/modify/select exactly one next chunk;
5. rewrite `NEXT.md`;
6. report routing + result;
7. STOP.

Do not execute the new NEXT chunk.
