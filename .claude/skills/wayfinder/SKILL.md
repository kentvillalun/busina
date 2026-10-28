---
name: wayfinder
description: Plan a chunk of work too big or too foggy for one session as a written map of decision tickets, then resolve them one at a time until the way is clear. Use only when the user asks for /wayfinder or says the work is too big to plan at once.
disable-model-invocation: true
---

<!-- Adapted from "wayfinder" in mattpocock/skills (MIT). See THIRD-PARTY-LICENSES.md. -->

# Wayfinder

A loose idea has arrived that is too big for one session, and the way to the end is not visible yet. Do not charge at
the end. First **find the way**: write a map of *decisions* to make, then resolve them one at a time.

**When not to use it:** small tasks, or work whose plan already fits in one session. Busina's normal work (a feature
slice with a clear scope) does not need a map; `PROJECT_SPEC.md` already holds that plan. Use wayfinder for big, uncertain
efforts (for example "the operator dashboard after the competition").

## Plan, don't do
Each ticket resolves a **decision**, not a piece of the build. The map is finished when the way is clear and nothing is
left to decide. The urge to just start building usually means you have reached the edge of the map: hand off.

## The map file: `docs/wayfinder/<effort-name>.md`
One file per effort, in the repo, so it is reviewed in a pull request like code.

```markdown
# <Effort name>

## Destination
<What reaching the end looks like: the spec, the decision, or the change. One or two lines.>

## Notes
<Domain, constraints, standing preferences, files or docs every session should read.>

## Open tickets
### T1: <short question as a title>   (type: grilling | research | prototype | task)   (blocked by: none)
**Question:** <the decision or investigation, small enough for one session>
**Status:** open | claimed by <name> | closed

## Decisions so far
- [T1: <title>](#t1-title): <one-line gist of the answer>

## Not yet specified
<Questions you can tell are coming but cannot yet state sharply. Graduates into tickets as the map advances.>

## Out of scope
<Work ruled beyond the destination, and why. Never graduates.>
```
A closed ticket keeps its section, with the **Answer:** written under the question. The "Decisions so far" list only
points at it; every decision lives in exactly one place.

## Ticket types
- **grilling**: a conversation with the human. Ask **one question at a time**, with your recommended answer for each,
  and wait. Never answer your own questions.
- **research**: find a fact (read docs, the code, a service's limits) and write the finding in the ticket.
- **prototype**: make a cheap, rough thing to react to (a sketch screen, a stub endpoint) and link it.
- **task**: manual work that must happen before a decision can be made (sign up for a service, get access, move data).
  Give the human a precise checklist if you cannot do it yourself.

## Fog or ticket?
It is a **ticket** if you can state the question precisely now, even if you cannot answer it yet. It is **fog** (Not yet
specified) if you cannot yet phrase it sharply. Do not slice fog into ticket-sized pieces; resolving a ticket clears the
fog ahead of it.

## Two modes

**Chart the map** (the user gives a loose idea):
1. Pin down the **destination** by grilling the human. The destination fixes the scope.
2. Grill again, **breadth first**, to list the open decisions and what can be taken first. If there is no fog (the way is
   already clear and small), say so and stop; no map is needed.
3. Create the map file: Destination, Notes, the tickets you can specify now (with who blocks whom), and the fog.
4. Stop. Charting is one session's work; it resolves nothing.

**Work through the map** (the user points at a map file):
1. Read the map (not every ticket). Pick the ticket the user named, or the first **open ticket that is not blocked**.
2. **Claim** it first (set Status to claimed by <name>) so a teammate does not take the same one.
3. Resolve it according to its type. **Resolve at most one ticket per session.**
4. Write the **Answer** under the ticket, set Status to closed, and add one line to "Decisions so far".
5. Add any new tickets the answer reveals, graduate fog that became specific, and move anything past the destination
   to "Out of scope" with one line saying why. Update or delete tickets the decision made obsolete.

Refer to tickets by their **title** when talking to the human, never by a bare number.
