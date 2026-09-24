# MODEL-ROUTING — Model and Execution Guidance

## Default
Prefer the user's normal/default configured model for routine tiny chunks.

Do not decide at runtime whether a normal chunk "deserves" ULW. ULW is controlled by explicit chunk metadata.

## ULW hard-stop gate

Use ULW only when the active chunk explicitly contains:

`ULW: REQUIRED`

If the active chunk contains `ULW: REQUIRED`, **STOP BEFORE IMPLEMENTATION**.

Do not:
- inspect implementation/source files beyond what was already needed to identify the chunk;
- run agent/model discovery;
- run Git/repository/server/port checks;
- start coding, testing, documentation sync, or delegation.

Print exactly one concise gate message:

`⛔ ULW REQUIRED FOR <CHUNK-ID> — execution paused before implementation. Switch model and/or enable ULW, then reply CONTINUE <CHUNK-ID>.`

The owner may then swap model and/or enable ULW.

When the owner explicitly replies `CONTINUE <CHUNK-ID>` (or clearly confirms ULW/model is ready for that chunk), treat the ULW gate as satisfied for that chunk in the current session and continue execution. **Do not stop a second time for the same chunk in the same session.**

If the session loses that confirmation/context, stop again rather than assuming ULW was enabled.

If the chunk does not contain `ULW: REQUIRED`, do not evaluate whether ULW might be useful. Continue with the normal configured model/mode.

## Future chunk metadata

ULW decisions belong in the chunk file when packs/chunks are authored or dynamically maintained. Future chunks should explicitly contain one of:

- `ULW: REQUIRED`
- `ULW: NOT REQUIRED`

Do not make OpenCode perform a fresh "does this need ULW?" analysis at launch.

## Sisyphus
Sisyphus is an execution/orchestration choice. Recommend it only when the chunk explicitly flags it or project rules require it.

Do not silently switch.

## Scope
Stronger models or agents never expand the active chunk's authorization.
