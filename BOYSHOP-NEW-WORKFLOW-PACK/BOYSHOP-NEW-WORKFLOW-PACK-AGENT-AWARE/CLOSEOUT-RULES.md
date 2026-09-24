# CLOSEOUT-RULES

Implementation and verification happen before closeout.

For read-only chunks, do not manufacture canonical project-doc changes.

For implementation chunks, update applicable canonical project docs once at the end.

Then update pack control files:
- `CURRENT-STATE.md`
- `IMPLEMENTATION-MAP.md`
- `NEXT.md`

Never treat the previously planned next chunk as automatically valid. Re-evaluate it against repo truth.

Git commit/tag/push remains approval-gated.
