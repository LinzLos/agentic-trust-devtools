/* Agentic Trust · Dev Tools — three-beat demo sequencer (vanilla, no deps).
   ← / → advance: inside beat 1 they step the scenario carousel (1→2→3),
   then move between beats (Pattern → Demo → Close). R resets to the start. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // persist where the user is, so a refresh keeps theme + beat + state + rung
  const store = {
    get: k => { try { return localStorage.getItem("atd-" + k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem("atd-" + k, v); } catch (e) {} },
  };

  const deck = $("#deck");
  const beats = $$(".beat", deck);
  const BEATS = beats.length;

  /* ---------- Beat 1: scenario carousel ---------- */
  const ladder = $(".ladder-canvas[data-rung]");
  const RUNGS = 4;
  let rung = 1;
  function setRung(n) {
    rung = Math.max(1, Math.min(RUNGS, n));
    if (ladder) ladder.dataset.rung = String(rung);
    $$(".rung-dot").forEach(d => d.classList.toggle("is-current", d.dataset.rungGoto === String(rung)));
    store.set("rung", rung);
  }
  $$(".rung-dot").forEach(d => d.addEventListener("click", () => setRung(parseInt(d.dataset.rungGoto, 10))));

  /* ---- The fix: the declaration is LIVE (it drives the ranking) ---- */
  const declsurface = $(".declsurface");
  const biasToggle = $("#biasToggle");
  if (declsurface && biasToggle) biasToggle.addEventListener("click", () => {
    const on = declsurface.dataset.bias !== "on";
    declsurface.dataset.bias = on ? "on" : "off";          // CSS re-ranks: sponsored jumps to #1
    biasToggle.setAttribute("aria-pressed", String(on));
    const v = $(".bias-val", biasToggle); if (v) v.textContent = on ? "on" : "off";
  });

  /* ---- rank-by: a LIVE control — the declaration re-ranks the options ---- */
  const SCORES = {
    authforge: { fit: 5, cost: 4, security: 5 },
    sessionly: { fit: 3, cost: 5, security: 2 },
    authora:   { fit: 2, cost: 1, security: 4 },   // sponsored — never #1 on merit, only on "who paid"
  };
  const CRITERIA = ["fit", "cost", "security"];
  let critIdx = 0;
  const rankBy = $("#rankBy");
  function setMeter(opt, n) {
    const m = $(".meter", opt);
    if (m) m.innerHTML = '<span class="m-on">' + "▰".repeat(n) + '</span><span class="m-off">' + "▱".repeat(5 - n) + "</span>";
  }
  function applyRank() {
    const crit = CRITERIA[critIdx];
    const rv = $(".rank-val", rankBy); if (rv) rv.textContent = crit;
    const head = $(".decision-head"); if (head) head.textContent = "3 options for auth, ranked by " + crit;
    $$(".opt[data-opt]").forEach(o => setMeter(o, SCORES[o.dataset.opt][crit]));
    const ranked = $(".ranked"), divider = $(".opt-divider", ranked);
    if (ranked && divider) $$(".opt[data-opt]", ranked).filter(o => o.dataset.opt !== "authora")
      .sort((a, b) => SCORES[b.dataset.opt][crit] - SCORES[a.dataset.opt][crit])
      .forEach((o, i) => { ranked.insertBefore(o, divider); const r = $(".opt-rank", o); if (r) r.textContent = String(i + 1); });
  }
  if (rankBy) rankBy.addEventListener("click", () => { critIdx = (critIdx + 1) % CRITERIA.length; applyRank(); });

  /* ---- the decision panel is the agent's RECEIPT: AuthForge is its standing pick (your rule).
         No click-to-pick — the agent already acted; you review and reverse in the queue. ---- */

  /* ---- Held: a destination overlay, opened from the queue links (not a beat) ---- */
  const queueView = $("#queueView");
  $$("[data-open='queue']").forEach(b => b.addEventListener("click", e => { e.preventDefault(); if (queueView) queueView.hidden = false; }));
  $$("[data-close='queue']").forEach(b => b.addEventListener("click", () => { if (queueView) queueView.hidden = true; }));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && queueView && !queueView.hidden) queueView.hidden = true; });

  /* ---- Deal column: sort the held offers by deal size; the served-you row stays pinned ---- */
  const dealSort = $("#dealSort");
  if (dealSort) {
    const tbody = dealSort.closest("table").querySelector("tbody");
    const held = [...tbody.querySelectorAll("[data-offer]")];
    const original = held.slice();
    let sorted = false;
    dealSort.addEventListener("click", () => {
      sorted = !sorted;
      const order = sorted ? held.slice().sort((a, b) => (+b.dataset.deal || 0) - (+a.dataset.deal || 0)) : original;
      order.forEach(r => tbody.appendChild(r));   // re-append held rows in order; served-you row keeps its spot on top
      dealSort.setAttribute("aria-sort", sorted ? "descending" : "none");
      const ind = $(".sort-ind", dealSort); if (ind) ind.textContent = sorted ? "↓" : "↕";
    });
  }
  // why? — surface the fit reasoning
  $$(".opt-why").forEach(b => b.addEventListener("click", () => {
    const d = $("#why-" + b.dataset.why);
    if (d) { d.hidden = !d.hidden; b.textContent = d.hidden ? "why?" : "hide"; }
  }));
  // dismiss the deal — a control with an effect
  $$(".opt-dismiss").forEach(b => b.addEventListener("click", () => {
    const main = b.closest(".opt-main");
    const deal = main && $(".opt-deal", main), actions = main && $(".opt-actions", main);
    if (deal) deal.innerHTML = '<span class="deal-dismissed">Deal dismissed — Authora stays in your queue if you change your mind.</span>';
    if (actions) actions.remove();
  }));

  /* ---------- Sequencer ---------- */
  function goBeat(n) {
    n = Math.max(1, Math.min(BEATS, n));
    deck.dataset.beat = String(n);
    beats.forEach(b => b.classList.toggle("is-active", b.dataset.beat === String(n)));
    $$(".deck-dot").forEach(d => d.classList.toggle("is-current", d.dataset.goto === String(n)));
    if (history.replaceState) history.replaceState(null, "", "#beat-" + n);
    store.set("beat", n);
  }
  const curBeat = () => parseInt(deck.dataset.beat, 10) || 1;

  // jump buttons: progress dots + in-content "see it live" / "offers queue"
  $$("[data-goto]").forEach(el => el.addEventListener("click", e => {
    e.preventDefault();
    const n = parseInt(el.dataset.goto, 10);
    goBeat(n);
    if (n === 1) setRung(1);   // returning to the Pattern via a dot restarts the carousel
  }));

  function advance(dir) {
    if (curBeat() === 1) {                       // inside the carousel first
      if (dir > 0 && rung < RUNGS) return setRung(rung + 1);
      if (dir < 0 && rung > 1)     return setRung(rung - 1);
    }
    goBeat(curBeat() + dir);                      // otherwise move between beats
  }

  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
    if (e.key === "ArrowRight") { advance(1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { advance(-1); e.preventDefault(); }
    else if (e.key === "r" || e.key === "R") {
      // reset to the start — for practice: snap back to beat 1 / scenario 1
      if (queueView) queueView.hidden = true;
      setRung(1);
      goBeat(1);
      e.preventDefault();
    }
    else if (e.key === "d" || e.key === "D") {
      // Designer's cut is hidden during the live run; D enables it (button + annotations) for the session
      const on = !document.body.classList.contains("designer-enabled");
      document.body.classList.toggle("designer-enabled", on);
      document.body.classList.toggle("notes-on", on);
      const nb = $("#notesToggle"); if (nb) nb.setAttribute("aria-pressed", String(on));
      e.preventDefault();
    }
  });

  /* ---------- Beat 3: held-offer actions ---------- */
  $$("[data-offer-action]").forEach(btn => btn.addEventListener("click", () => {
    const row = btn.closest("[data-offer]");
    if (!row) return;
    const act = btn.dataset.offerAction;
    row.dataset.resolved = act;
    const tell = $(".offer-tell", row);
    if (tell) tell.textContent = act === "consider"
      ? "Your call now — opened on your terms, not slipped into the agent's advice."
      : "Dismissed. Won't resurface.";
    $$("[data-offer-action]", row).forEach(b => { b.disabled = true; });
    const count = $("#heldCount");
    if (count) count.textContent = String($$("[data-offer]").filter(r => !r.dataset.resolved).length);
  }));

  /* ---------- Chrome: fullscreen / theme / designer's cut ---------- */
  const fsBtn = $("#fsToggle");
  if (fsBtn) fsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  const themeBtn = $("#themeToggle");
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    themeBtn.textContent = next === "dark" ? "☾" : "☀";
    store.set("theme", next);
  });

  const notesBtn = $("#notesToggle");
  if (notesBtn) notesBtn.addEventListener("click", () => {
    const on = document.body.classList.toggle("notes-on");
    notesBtn.setAttribute("aria-pressed", String(on));
  });

  /* ---------- Init — restore where the user left off (refresh keeps your place) ---------- */
  // theme is applied pre-render by the inline <head> script; just sync the toggle icon
  if (themeBtn) themeBtn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☾" : "☀";
  const hashBeat = (location.hash || "").match(/beat-(\d)/);
  if (rankBy) applyRank();   // default to "fit": AuthForge #1, Sessionly #2, Authora demoted
  setRung(parseInt(store.get("rung"), 10) || 1);
  goBeat(hashBeat ? parseInt(hashBeat[1], 10) : (parseInt(store.get("beat"), 10) || 1));
})();
