# Agentic Trust

**[Open the live demo →](https://linzlos.github.io/agentic-trust-devtools/)**

A concept demo about how products should reach you in the agent era: matched by fit, shown in the open, on your clock.

## The POV

Right now, ads interrupt. You finish a checkout and get an upsell. A hospital's voice agent pitches you a device before it will take your payment. A coding agent recommends a vendor whose slot was paid for, and you were never there to see it.

The skip button is disappearing. As agents start making choices for us, the ad climbs into the recommendation itself, somewhere you can't see it and can't decline. I watched the first two happen. The third is close.

But the agent layer doesn't have to be the next place ads ambush you. It can be the first place they don't. An agent that knows your context can surface what actually fits, show who's behind it, and hold the rest until you're ready to shop. That's the bet: not blocking ads, but a marketplace built on fit, where what reaches you is something you'd actually want, when you're actually looking.

## The fix

A declarative trust layer. You write one standing rule. The agent acts on it and shows its work.

In the demo the rule is plain: rank by fit, wire the best fit for me, and hold anything that spends my money in a queue I control. The agent picks the auth provider that actually fits the stack. The option that paid for placement isn't blocked and isn't hidden. It's ranked where it earns, its deal shown in full, and routed to a queue I open when I'm ready to shop.

Nothing is buried. Nothing is forced. The paid offer is still there if the economics are worth it. The difference is that I see the whole picture and choose on my own clock, instead of getting it slipped into the answer.

And the shift is bigger than one rule. When agents rank by fit, the lever stops being who paid and becomes what fits. Good products surface on merit. Ads turn into things you actually want, reaching you when you're looking for them.

## What's in it

1. **Pattern.** The origin ladder: a checkout upsell, a hospital phone agent, a coding agent. Each rung less visible and less skippable than the one before.
2. **Demo.** The declarative trust layer. A standing declaration governs the ranking. Flip pay-to-rank to see the before and after in one view.
3. **Close.** What I'm describing doesn't exist yet. Every precondition has shipped.

The queue is the second half of the idea. It's where held offers wait, with a column for who each one actually served. You go to it when you're ready to shop, instead of offers chasing you mid-task. It's a way to interact with an agent that isn't a chat window.

## Built with

[Tiny Wire](https://linzlos.github.io/tiny-wire/), my open design system. This repo is a vendored consumer of it (see `lib/` and `scripts/`). One self-contained page. Vanilla HTML, CSS, and JavaScript. No build step, no dependencies. Every color, space, and radius comes from a design token.

## Run it locally

```bash
python3 -m http.server 4318
# open http://localhost:4318
```

Getting around:

- **Swipe or the arrow keys** move through the sequence. Inside the Pattern, they step the scenario cards first.
- **Tap a section** in the progress bar (Pattern / Demo / Close) to jump to it.
- **Designer's cut**: the toggle in the top bar (or **D** on a keyboard) reveals the design notes (Decision, Why, Trade-off) behind the Pattern, the Demo, and the queue.
- **R** resets to the start.
- **Theme**: the top-bar toggle switches light and dark, dark by default.

## Notes

- All vendor names in the demo are fictional placeholders. The one real screenshot is documentary.
- Offline safe: `lib/` is vendored locally, and fonts fall back to system fonts with no network.
- Reduced motion: all transitions are disabled under `prefers-reduced-motion`.

---

Concept, design, and build by **Lindsay Zuñiga**, product designer.

© 2026 Lindsay Zuñiga. All rights reserved. This work is proprietary. See [LICENSE](LICENSE). You're welcome to view the live demo and link to it; please don't copy, reuse, or repurpose the code, design, or content without permission.
