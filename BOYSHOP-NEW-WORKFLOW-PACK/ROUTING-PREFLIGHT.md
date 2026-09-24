# ROUTING-PREFLIGHT — Run Before Every Chunk

This is a mandatory launch gate.

## Step 1 — Read active work
Read `NEXT.md` and the referenced chunk.
Do not execute yet.

## Step 2 — Discover agents
Enumerate all currently installed/available OMO agents from the actual OMO/OpenCode environment.

Do not use a stale remembered list.

## Step 3 — Evaluate every installed agent
For each agent, evaluate fit for:
- task type;
- tools/capabilities;
- read/write scope;
- repository exploration;
- architecture depth;
- security sensitivity;
- testing/verification;
- current configured model/provider.

## Step 4 — Route
Choose:
- one primary agent;
- optional support/reviewer only if useful;
- model guidance;
- Sisyphus yes/no.

## Step 5 — Approval/model check
If routing implies an unauthorized model/provider or gated external action, stop and surface the advisory/decision before executing.

## Step 6 — Execute
Only after routing is valid, launch exactly the active chunk.

## Step 7 — Closeout
After verification, re-run planning against actual repo state and rewrite `NEXT.md`.

Do not pre-route the future next chunk as final: routing must be reassessed at its launch because installed agents/configuration may have changed.
