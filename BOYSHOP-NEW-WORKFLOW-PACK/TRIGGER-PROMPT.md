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

Before the active chunk launches, perform the mandatory routing preflight:

- dynamically discover **all OMO agents currently installed/available**;
- evaluate every installed agent against the active chunk;
- select the best primary agent;
- choose optional support/reviewer agents only when useful;
- evaluate the configured model/provider implication;
- recommend ULW/DeepSeek only when genuinely needed;
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
