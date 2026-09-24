# ROUTING-PREFLIGHT — Run Before Every Chunk

This is a mandatory launch gate.

## Step 1 — Read active work and check ULW
Read `NEXT.md` and the referenced chunk. Do not execute yet.

If the active chunk contains `ULW: REQUIRED`, apply the hard-stop gate from `MODEL-ROUTING.md` immediately. Stop before agent discovery or implementation and wait for `CONTINUE <CHUNK-ID>`.

If the ULW gate was already explicitly satisfied for this chunk in the current session, continue without stopping again.

If `ULW: REQUIRED` is absent, do not analyze whether ULW would be useful.

## Step 2 — Discover agents
Enumerate all currently installed/available OMO agents from the actual OMO/OpenCode environment only when the pack's routing rules require discovery.

Do not use a stale remembered list.

## Step 3 — Evaluate installed agents
For each relevant agent, evaluate fit for:
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
Only after all applicable gates are satisfied, launch exactly the active chunk.

## Step 7 — Closeout
After verification, re-run planning against actual repo state and rewrite `NEXT.md`.

Do not pre-route the future next chunk as final: routing must be reassessed at its launch because installed agents/configuration may have changed.
