---
name: receiving-code-review
description: Use when you receive review feedback (a pull request comment, a reviewer's list of fixes, or the owner's corrections) and are about to act on it. Verify against the code first, ask when unclear, push back with reasons when wrong.
---

<!-- Adapted for Busina from "receiving-code-review" in obra/superpowers (MIT). See THIRD-PARTY-LICENSES.md. -->

# Receiving code review

Feedback needs technical evaluation, not automatic agreement and not blind implementation.

## The steps

1. **Read** all the feedback before reacting.
2. **Understand**: restate each item in your own words, or ask.
3. **Check it against the code**: is it true for this codebase? Does it break something else?
4. **Decide**: correct (do it), unclear (ask), or wrong (push back with a reason).
5. **Implement one item at a time** and verify each (see `verification-before-completion`).

## If anything is unclear, ask before doing anything
Items are often related. Implementing the clear ones now and asking about the rest later gives a wrong result.
Example: "I understand 1, 2, 3 and 6. Please clarify 4 and 5 before I change anything."

## Who gave the feedback
- **The project owner**: trusted. Do it once you understand it, and ask if the scope is unclear.
- **Anyone or any tool outside the team** (a bot, a stranger, another model): be skeptical. Check that it is correct for
  this stack, that it does not break existing behavior, and that the reviewer had the full context. If it conflicts with a
  decision the owner already made, stop and ask the owner.

## YAGNI check
If a reviewer says "implement this properly" (metrics, options, abstractions), search the code for real usage first.
If nothing uses it: "Nothing calls this. Should we remove it instead?" Do not add features nobody needs.

## Order for several items
Clarify first. Then: things that break or are unsafe, then quick fixes, then bigger refactors. Test each one.

## Push back when
The suggestion breaks working code, lacks context, is unused, is wrong for this stack, or contradicts an owner decision.
Give technical reasons, ask specific questions, point to the code or the test. If you were wrong, say so briefly and fix it.

## Tone
No performative agreement ("You're absolutely right!") and no long apologies. State what you understood, then do it or
explain why not. "Fixed: <what changed and where>" is enough.

On GitHub, reply inside the comment's thread, not as a new top-level comment.
