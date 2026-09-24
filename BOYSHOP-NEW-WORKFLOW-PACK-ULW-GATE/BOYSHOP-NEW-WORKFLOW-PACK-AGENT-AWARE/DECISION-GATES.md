# DECISION-GATES

Stop for explicit user/CEO approval where applicable:
- Git commit/tag/push;
- live DB migration;
- `MOLLIE_ALLOW_LIVE=true`;
- production payment activation;
- production/live-impacting deployment;
- destructive database action;
- destructive replacement/deletion of approved template/layout;
- ambiguous-file ownership;
- material new dependency/provider commitment;
- model/provider escalation when user authorization is required;
- scope expansion beyond the active chunk.

A blocked decision becomes the single `NEXT.md` item when nothing else can safely proceed.
