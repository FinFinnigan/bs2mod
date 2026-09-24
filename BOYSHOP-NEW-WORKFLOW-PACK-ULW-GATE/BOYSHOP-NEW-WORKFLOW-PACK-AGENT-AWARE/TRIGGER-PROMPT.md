# BoyShop Agent-Aware Session Trigger

Start or resume the BoyShop / BS2Mod tiny-chunk workflow.

Project root:
`C:\dev\BS2Mod`

Workflow pack:
`C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK`

Read first:

1. `C:\dev\BS2Mod\AGENTS.md`
2. `C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK\MASTER-SPEC.md`
3. `C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK\CURRENT-STATE.md`
4. `C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK\IMPLEMENTATION-MAP.md`
5. `C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK\WORKFLOW-RULES.md`
6. `C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK\DECISION-GATES.md`
7. `C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK\AGENT-ROUTING.md`
8. `C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK\MODEL-ROUTING.md`
9. `C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK\ROUTING-PREFLIGHT.md`
10. `C:\dev\BS2Mod\BOYSHOP-NEW-WORKFLOW-PACK\NEXT.md`

Before any routing/discovery/implementation, inspect the active chunk for an explicit ULW marker.

- If it contains `ULW: REQUIRED`, STOP immediately and print:
  `⛔ ULW REQUIRED FOR <CHUNK-ID> — execution paused before implementation. Switch model and/or enable ULW, then reply CONTINUE <CHUNK-ID>.`
- Do not perform agent discovery, model discovery, repo inspection, Git inspection, server checks, or implementation after this stop.
- When the owner replies `CONTINUE <CHUNK-ID>`, treat the gate as satisfied for that chunk in the current session and continue without stopping again.
- If `ULW: REQUIRED` is absent, do not decide dynamically whether ULW is needed.

Before the active chunk launches, perform the mandatory routing preflight:

- dynamically discover **all OMO agents currently installed/available**;
- evaluate every installed agent against the active chunk;
- select the best primary agent;
- choose optional support/reviewer agents only when useful;
- evaluate the configured model/provider implication;
- never decide ULW dynamically; obey only the active chunk's explicit `ULW: REQUIRED` / `ULW: NOT REQUIRED` metadata;
- warn if Sisyphus is genuinely the better execution/orchestration choice;
- never silently switch model/provider;
- never let routing expand the chunk scope.

Then execute **only the single chunk referenced by `NEXT.md`**.

After implementation and verification:
- re-evaluate the actual repository state;
- do not assume the preplanned next chunk remains correct;
- skip satisfied work;
- split work that is too large;
- add prerequisites revealed by evidence;
- reorder remaining chunks if dependencies changed;
- perform one consolidated applicable project-doc sync;
- update `CURRENT-STATE.md`;
- update `IMPLEMENTATION-MAP.md`;
- create/modify/select exactly one next chunk;
- rewrite `NEXT.md`;
- STOP.

Do not execute the newly selected next chunk in the same run.

Begin now.
