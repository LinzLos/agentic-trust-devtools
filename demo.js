/* © 2026 Lindsay Zuñiga. All rights reserved. See LICENSE.
   Agentic Trust · Dev Tools — three-beat demo sequencer (vanilla, no deps).
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
    updateProgress();
  }
  $$(".rung-dot").forEach(d => d.addEventListener("click", () => setRung(parseInt(d.dataset.rungGoto, 10))));

  /* ---------- mobile progress nav: segmented Pattern/Demo/Close; active section shows its slide dots ---------- */
  function updateProgress() {
    const b = curBeat();
    $$(".pnav-seg").forEach(s => s.classList.toggle("is-active", s.dataset.seg === String(b)));
    const seg = $('.pnav-seg[data-seg="' + b + '"]');
    if (seg) { const idx = b === 1 ? rung - 1 : 0; $$(".pnav-dot", seg).forEach((d, i) => d.classList.toggle("is-current", i === idx)); }
  }
  $$(".pnav-seg").forEach(s => s.addEventListener("click", e => {
    const n = parseInt(s.dataset.seg, 10);
    const dot = e.target.closest(".pnav-dot");
    if (n === 1 && dot) { goBeat(1); setRung($$(".pnav-dot", s).indexOf(dot) + 1); return; }  // a specific scenario dot
    goBeat(n);
    if (n === 1) setRung(1);
  }));

  /* ---------- one swipe axis: advance() steps rungs through Pattern, then moves between beats.
       shared by touchscreen swipe and trackpad/wheel horizontal swipe. ---------- */
  function dismissHint() { document.body.classList.add("swiped"); store.set("hinted", "1"); }
  function swipeNav(dir) {
    if (queueView && !queueView.hidden) { queueView.hidden = true; if (dir > 0) goBeat(curBeat() + 1); return; }
    advance(dir); dismissHint();
  }
  {
    // touchscreen
    let sx = 0, sy = 0, tracking = false;
    deck.addEventListener("touchstart", e => {
      if (e.touches.length !== 1) { tracking = false; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    deck.addEventListener("touchend", e => {
      if (!tracking) return; tracking = false;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) swipeNav(dx < 0 ? 1 : -1);   // swipe left = forward
    }, { passive: true });
  }
  {
    // trackpad / mouse-wheel horizontal swipe (desktop): one step per gesture; a reversed swipe re-arms instantly
    let locked = false, accum = 0, lastDir = 0, settle = null;
    deck.addEventListener("wheel", e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;   // vertical-dominant → let it scroll
      e.preventDefault();                                     // suppress the macOS two-finger back-swipe
      clearTimeout(settle);
      settle = setTimeout(() => { locked = false; accum = 0; lastDir = 0; }, 100);
      const dir = e.deltaX > 0 ? 1 : -1;
      if (locked) {
        if (dir === lastDir) return;                          // same-direction momentum → ignore
        locked = false; accum = 0;                            // direction reversed → re-arm right away
      }
      accum += e.deltaX;
      if (Math.abs(accum) > 28) { const d = accum > 0 ? 1 : -1; swipeNav(d); lastDir = d; accum = 0; locked = true; }
    }, { passive: false });
  }

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

  /* ---- AGENT RUN rail: collapse control (collapsed on mobile, open on desktop) ---- */
  const ideRail = $(".ide-rail"), railToggle = $(".rail-toggle");
  if (ideRail && railToggle) {
    const setRail = c => { ideRail.dataset.collapsed = String(c); railToggle.setAttribute("aria-expanded", String(!c)); };
    railToggle.addEventListener("click", () => setRail(ideRail.dataset.collapsed !== "true"));
    const railMq = window.matchMedia("(max-width: 760px)");
    setRail(railMq.matches);                                  // mobile → accordion closed; desktop → rail shown
    railMq.addEventListener("change", e => setRail(e.matches));   // reset the default when crossing the breakpoint
  }

  /* ---------- Sequencer ---------- */
  function goBeat(n) {
    n = Math.max(1, Math.min(BEATS, n));
    deck.dataset.beat = String(n);
    beats.forEach(b => b.classList.toggle("is-active", b.dataset.beat === String(n)));
    $$(".deck-dot").forEach(d => d.classList.toggle("is-current", d.dataset.goto === String(n)));
    if (history.replaceState) history.replaceState(null, "", "#beat-" + n);
    store.set("beat", n);
    updateProgress();
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
    // queue overlay open: arrows leave it — → continues to the Close, ← returns to the build
    if (queueView && !queueView.hidden) {
      if (e.key === "ArrowRight") { queueView.hidden = true; goBeat(curBeat() + 1); e.preventDefault(); return; }
      if (e.key === "ArrowLeft")  { queueView.hidden = true; e.preventDefault(); return; }
    }
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
      // D toggles the designer's cut notes (the visible toggle does the same on tap/click)
      const on = document.body.classList.toggle("notes-on");
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
    root.setAttribute("data-theme", next);   // CSS swaps the Phosphor sun/moon by [data-theme]
    store.set("theme", next);
  });

  const notesBtn = $("#notesToggle");
  if (notesBtn) notesBtn.addEventListener("click", () => {
    const on = document.body.classList.toggle("notes-on");
    notesBtn.setAttribute("aria-pressed", String(on));
  });

  /* ---------- Init — restore where the user left off (refresh keeps your place) ---------- */
  // theme is applied pre-render by the inline <head> script; the sun/moon icon is CSS-driven by [data-theme]
  if (store.get("hinted")) document.body.classList.add("swiped");   // don't re-show the swipe hint once dismissed
  const hashBeat = (location.hash || "").match(/beat-(\d)/);
  if (rankBy) applyRank();   // default to "fit": AuthForge #1, Sessionly #2, Authora demoted
  setRung(parseInt(store.get("rung"), 10) || 1);
  goBeat(hashBeat ? parseInt(hashBeat[1], 10) : (parseInt(store.get("beat"), 10) || 1));
})();
