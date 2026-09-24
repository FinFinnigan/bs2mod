# AGENT-ROUTING — Mandatory OMO Agent Selection

## Goal

Before every chunk launches, evaluate **all OMO agents currently installed and available in this OpenCode/OMO environment** and choose the best routing for that one chunk.

Do not hardcode an agent inventory into this pack. Installed agents can change over time.

## Mandatory discovery

At chunk launch:

1. Discover/enumerate the complete currently installed OMO agent set using the agent registry/configuration available to the running OMO/OpenCode installation.
2. Read each discovered agent's declared purpose, capabilities, limitations and configured model/provider where exposed.
3. Compare every installed agent against:
   - the active chunk's task type;
   - required tools;
   - read-only versus write behavior;
   - architecture/security depth;
   - repository breadth;
   - verification needs;
   - approval constraints.
4. Select the best **primary agent**.
5. Select supporting/reviewer agents only if they materially improve the chunk.
6. Do not invoke every agent merely because every agent must be considered.

## Routing principle

**Consider all; use only what is useful.**

The router must never select an agent because of its name alone. Use the actual installed agent description/capabilities.

## Primary versus support

Normally use one primary agent.

Optional support roles may be used for:
- repository exploration;
- architecture review;
- security review;
- research/documentation lookup;
- targeted verification.

Do not create agent fan-out for a trivial chunk.

## Sisyphus

If Sisyphus is installed, treat it as a possible orchestration/execution choice, not a universal default.

Recommend/select it only when the active chunk genuinely benefits from coordinated multi-step investigation or orchestration.

A chunk having several files is not sufficient reason.

## Agent/model interaction

Agent routing and model routing are separate.

An agent may already be configured to a specific model. Before selecting it, check whether that implies a model/provider escalation.

Never silently route work onto a provider/model the user has not authorized.

If the best agent would require such escalation, report the advisory and follow `MODEL-ROUTING.md`.

## Mandatory routing record

Before execution, produce internally and in the final chunk report:

- all installed agents considered;
- primary agent selected;
- optional supporting/reviewer agents;
- model recommendation;
- whether Sisyphus is recommended;
- one concise routing reason.

## Generated chunks

Never permanently bind a generated future chunk to a named agent as if the installed set cannot change.

Instead each generated chunk must contain:

`Routing: run mandatory agent-aware preflight before execution.`

It may additionally record a *capability preference*, e.g.:
- repository exploration;
- implementation;
- architecture;
- security;
- QA;

but the actual named agent must be chosen at launch from the agents then installed.

## Failure handling

If the installed agent inventory cannot be discovered reliably:
- do not invent an agent list;
- use the current active agent only if safe;
- report `AGENT ROUTING DEGRADED`;
- do not broaden the chunk;
- continue only if the active chunk is safe under the current agent.
