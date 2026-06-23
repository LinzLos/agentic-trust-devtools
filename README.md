# Agentic Trust

**[Open the live demo →](https://linzlos.github.io/agentic-trust-devtools/)**

A short concept demo about where advertising goes next, and a design answer to it.

## The POV

When you finish a checkout, you get an upsell you can decline. When a hospital's voice agent takes your payment, it pitches you first and you cannot skip it. When a coding agent recommends a vendor, the slot can be paid for, and you were never there to see it.

The skip button is disappearing. As agents start making choices on your behalf, the ad climbs a layer into the recommendation itself, to a place you cannot see and cannot decline. I watched the first two happen in real life. The third one is close.

I am not against advertising. I am against the ambush. A sponsor should be able to win your business in the open, on your terms, weighed against fit. Not slipped into the advice under pressure.

## The fix

A declarative trust layer. You write a standing rule once. The agent acts on it and shows its work.

In the demo the rule is plain: rank by fit, wire the best fit for me, and hold anything that spends my money in a queue I control. So the agent picks the auth provider that actually fits the stack. The sponsored option that paid for placement gets demoted to where it belongs, its deal shown rather than hidden, and routed to a queue I review on my own clock.

Nothing is blocked. Nothing is hidden. The paid offer is still there if I decide the economics are worth it. The difference is that I decide, with the full picture, instead of getting it injected into the answer.

## What's in it

1. **Pattern.** The origin ladder: a checkout upsell, a hospital phone agent, a coding agent. Each rung less visible and less skippable than the one before.
2. **Demo.** The declarative trust layer. A standing declaration governs the ranking. Flip pay-to-rank to see the before and after in a single view.
3. **Close.** What I am describing does not exist yet. Every precondition has shipped.

The queue is the second half of the idea. It is a ledger of what the agent did and what it held, with a column for who each offer actually served. It is a way to interact with an agent that is not a chat window.

## Built with

[Tiny Wire](https://linzlos.github.io/tiny-wire/), my open design system. This repo is a vendored consumer of it (see `lib/` and `scripts/`). One self-contained page. Vanilla HTML, CSS, and JavaScript, no build step and no dependencies. Every color, space, and radius comes from design tokens.

## Run it locally

```bash
python3 -m http.server 4318
# open http://localhost:4318
```

Keyboard during the run:

- **Left / Right**: move between beats. Inside beat 1 they step the three scenarios first.
- **R**: reset to the start, for a clean practice run.
- **D**: reveal the designer's notes (the Decision / Why / Trade-off on each beat).
- **Theme toggle** (top bar): light or dark. The demo is dark by default, tuned for projection.

## Notes

- All vendor names in the demo are fictional placeholders. The one real screenshot is documentary.
- Offline safe: `lib/` is vendored locally, and fonts fall back to system fonts with no network.
- Reduced motion: all transitions are disabled under `prefers-reduced-motion`.

---

Concept, design, and build by **Lindsay Zuñiga**, product designer.

© 2026 Lindsay Zuñiga. All rights reserved. This work is proprietary — see [LICENSE](LICENSE). You're welcome to view the live demo and link to it; please don't copy, reuse, or repurpose the code, design, or content without permission.
