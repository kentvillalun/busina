---
name: verification-before-completion
description: Use before saying that work is done, fixed, working or passing, and before committing or opening a pull request. Run the check, read the real output, then claim. Evidence before assertions.
---

<!-- Adapted for Busina from "verification-before-completion" in obra/superpowers (MIT). See THIRD-PARTY-LICENSES.md. -->

# Verification before completion

**Rule: no "done" without fresh evidence from this session.** If you have not run the check just now, you cannot say it works.

## The gate

Before claiming any status:
1. **Identify** the command or action that proves the claim.
2. **Run** it fully (fresh, not remembered from earlier).
3. **Read** the real output: status code, exit code, errors, what is on screen.
4. **Decide** whether it confirms the claim. If not, report the actual state with the evidence.
5. **Only then** say it works.

## What counts as evidence here

| Claim | Proof | Not enough |
|---|---|---|
| "The API endpoint works" | `curl` it and read the status and body (also the failure cases: no key, bad body) | "The code looks right" |
| "The schema is fine" | `npx prisma validate`, and read the generated migration SQL before applying | Validate passing alone (it does not catch a wrong type or a typo in an enum value) |
| "The app compiles" | `npx expo export --platform android` exits clean | The dev server not complaining yet |
| "The screen is correct" | Run it on the emulator and look at it, also on a small screen (360x640) | Reading the JSX |
| "Permissions / storage work" | Trigger the real dialog or action and check the result | Assuming the library does it |
| "No secrets are exposed" | Search the response or the files that will be committed for the actual values | "I did not add any" |
| "A bug is fixed" | Re-run the original reproduction and see it pass | "I changed the line" |
| "A helper agent finished" | Look at the real diff and re-check it | Its report |

## Red flags: stop
Wording like "should work", "probably", "seems to", "looks good", "done!" before you have run anything; committing or
pushing unchecked; trusting an agent's success message; "just this once"; being tired and wanting it over.
A partial check proves nothing about the rest.

## If you could not verify something
Say so plainly: what you ran, what you could not run (for example "not tested on a real phone: haptics and push need a
device or a development build"), and what the risk is. An honest "not verified" is better than a confident guess.
