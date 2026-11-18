/**
 * scripts/gen-research-pdf.mjs
 *
 * Generates docs/research-later-features.pdf — the deferred-features research
 * document. Hand-rolled, dependency-free, text-only PDF writer (Helvetica).
 * Run: node scripts/gen-research-pdf.mjs
 */
import fs from "node:fs";
import path from "node:path";

/* ------------------------------------------------------------------ page */
const PW = 595.28, PH = 841.89; // A4
const MX = 62, MT = 60, MB = 68;
const CW = PW - MX * 2;

/* ------------------------------------------------------------------ text */
function ascii(s) {
  return String(s)
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, "--").replace(/\u2013/g, "-").replace(/\u2192/g, "->")
    .replace(/\u00d7/g, "x").replace(/\u2026/g, "...").replace(/\u00b7/g, "*")
    .replace(/\u20a6/g, "N").replace(/\u00bd/g, "1/2").replace(/\u00bc/g, "1/4")
    .replace(/\u2264/g, "<=").replace(/\u2265/g, ">=").replace(/\u207b/g, "-")
    .replace(/\u207a/g, "+").replace(/\u00b2/g, "2").replace(/\u00b3/g, "3")
    .replace(/\u03bb/g, "lambda").replace(/\u03b8/g, "theta").replace(/\u03a9/g, "ohm")
    .replace(/\u2212/g, "-").replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7E]/g, "?");
}
function esc(s) { return ascii(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }
function wrap(text, size, bold) {
  const per = size * (bold ? 0.545 : 0.5); // conservative Helvetica estimate
  const max = Math.floor(CW / per);
  const out = [];
  for (const para of ascii(text).split("\n")) {
    let line = "";
    for (const w of para.split(/\s+/)) {
      const t = line ? line + " " + w : w;
      if (t.length > max && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  return out;
}

/* ------------------------------------------------------------------ doc */
const F1 = "Helvetica", F2 = "Helvetica-Bold", F3 = "Helvetica-Oblique";

class Doc {
  constructor() { this.pages = []; this.pageNo = 0; this._new(); }
  _new() {
    this.pageNo++;
    this.y = PH - MT;
    this.ops = [];
    this.pages.push(this.ops);
  }
  _need(h, keepWith = 0) {
    if (this.y - h - keepWith < MB) this._new();
  }
  _tj(text, { f = F1, size = 10.5, x = MX, lead = 15, color = null } = {}) {
    const c = color ? `${color} rg\n` : "";
    this.ops.push(
      `BT ${c}/${f} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${this.y.toFixed(2)} Tm (${esc(text)}) Tj ET`
    );
  }
  h1(title, tag = null) {
    this._need(46, 64);
    this.y -= 14;
    if (tag) {
      this._tj(tag, { f: F3, size: 9, color: "0.45 0.4 0.33" });
      this.y -= 14;
    }
    this._tj(title, { f: F2, size: 17, lead: 21 });
    this.y -= 21;
    this.ops.push(`0.2 0.12 0.05 RG 1.1 w ${MX} ${(this.y + 6).toFixed(2)} m ${(PW - MX).toFixed(2)} ${(this.y + 6).toFixed(2)} l S`);
    this.y -= 16;
  }
  h2(t) {
    const lines = wrap(t, 12.5, true);
    this._need(lines.length * 17 + 22, 40);
    this.y -= 11;
    for (const l of lines) { this._tj(l, { f: F2, size: 12.5, lead: 17 }); this.y -= 17; }
    this.y -= 5;
  }
  p(t) {
    const lines = wrap(t, 10.5, false);
    for (const l of lines) {
      this._need(15);
      this._tj(l, { size: 10.5, lead: 15 });
      this.y -= 15;
    }
    this.y -= 5;
  }
  b(t) {
    const lines = wrap(t, 10.5, false);
    for (let i = 0; i < lines.length; i++) {
      this._need(15);
      this._tj(lines[i], { size: 10.5, lead: 15, x: MX + 16 });
      if (i === 0) this._tj("*", { f: F2, size: 10.5, x: MX + 2 });
      this.y -= 15;
    }
    this.y -= 3;
  }
  note(t) {
    const lines = wrap(t, 9.5, false);
    for (const l of lines) {
      this._need(13);
      this._tj(l, { f: F3, size: 9.5, lead: 13, color: "0.4 0.35 0.28" });
      this.y -= 13;
    }
    this.y -= 4;
  }
  hr() {
    this._need(20);
    this.y -= 8;
    this.ops.push(`0.75 0.68 0.6 RG 0.6 w ${MX} ${this.y.toFixed(2)} m ${(PW - MX).toFixed(2)} ${this.y.toFixed(2)} l S`);
    this.y -= 12;
  }
}

/* section registry for the TOC (two-pass; the list is static so both passes
   render identical TOC height and page numbers stay true) */
const SECTIONS = [
  { title: "Where Past Graph stands", tag: "the platform this research builds on" },
  { title: "The fog-of-war syllabus map", tag: "progress as visible territory" },
  { title: "Pull-a-step", tag: "the hint economy for constructives" },
  { title: "Lift-out", tag: "portable question objects" },
  { title: "Authoring studio", tag: "internal-first, invited authors later" },
  { title: "Creator program", tag: "content at scale, rev-share" },
  { title: "Groups and ranks", tag: "the social floor under the learn spaces" },
  { title: "Learn spaces", tag: "rooms, bubbles, pointers, and the event log" },
  { title: "Cross-cutting decisions", tag: "what every feature above must obey" },
  { title: "Decision log", tag: "what we chose and why, recorded for the next reader" },
];
const tocPages = new Array(SECTIONS.length).fill(0);
let d;

function S(i) {
  const { title, tag } = SECTIONS[i];
  d.h1(title, tag);
  tocPages[i] = d.pageNo;
}

/* ------------------------------------------------------------------ pass */
function build() {
  d = new Doc();
  tocPages.fill(0);

  /* ---- cover ---- */
  d.y = PH - 170;
  d._tj("PAST GRAPH", { f: F2, size: 13, lead: 16, color: "0.55 0.35 0.1" });
  d.y -= 34;
  d._tj("Research: the later features", { f: F2, size: 30, lead: 36 });
  d.y -= 40;
  d._tj("Fog-of-war syllabus map, pull-a-step, lift-out, authoring,", { size: 12.5, lead: 19 });
  d.y -= 19;
  d._tj("creator program, groups and ranks, learn spaces.", { size: 12.5, lead: 19 });
  d.y -= 60;
  d._tj(`Committed ${new Date().toDateString()} -- internal design document.`, { f: F3, size: 10, lead: 14, color: "0.4 0.35 0.28" });
  d.y -= 14;
  d._tj("Everything here is buildable on the current stack (Next.js + Supabase) with", { f: F3, size: 10, lead: 14, color: "0.4 0.35 0.28" });
  d.y -= 14;
  d._tj("no new infrastructure beyond what sections name explicitly.", { f: F3, size: 10, lead: 14, color: "0.4 0.35 0.28" });
  d._new();

  /* ---- TOC ---- */
  d.h1("Contents");
  SECTIONS.forEach((s, i) => {
    const t = `${i + 1}. ${s.title}`;
    d._tj(t, { f: F2, size: 11, lead: 15 });
    d._tj(tocPages[i] ? String(tocPages[i]) : "-", { f: F1, size: 11, lead: 15, x: PW - MX - 20 });
    d.y -= 20;
  });
  d._new();

  /* ---- 0. where we stand ---- */
  S(0);
  d.p("Past Graph is a JAMB/UTME study app: the full past-question archive rendered as a feed and a paper hall, watch-and-learn videos with annotation overlays (notes, simulations, articles), retrieval quizzes that tie a return thread through the video, a Pathfinder that ranks what to study next, and six-month premium for N750 paid through Paystack or Flutterwave.");
  d.p("Current inventory: 4,142 past questions (871 free, 2021-2025 by the GENERATED is_free rule), 31 articles, 51 videos carrying 169 annotations, 3 interactive simulations, economics papers 2021-2025, constructives with step scenes, and a new blanks kind (token-tray fill-ins). The stack: Next.js App Router, Supabase (Postgres + auth + REST), PWA shell, zero external dependencies on the client side beyond YouTube and payment embeds.");
  d.p("This document researches the deferred features -- the ones deliberately left out of the launch batch -- in enough depth that each can be built without re-deriving its design. For every feature: what it is, why it earns its place, the interaction design, the architecture, the data model, the risks, and the build order.");
  d.hr();

  /* ---- 1. fog map ---- */
  S(1);
  d.h2("The idea");
  d.p("The whole JAMB syllabus becomes one explorable territory, strategy-game style. Every topic is a region; untouched regions sit under fog; mastery is literally clearing the map. A student opens the map and sees not a list, but a landscape: where they have been, where they are avoiding, and what the path to their target course crosses next.");
  d.h2("Fog states -- all computed from attempts we already collect");
  d.b("Fogged -- zero attempts in the topic. The topic's name is readable on the tile's border; nothing inside is visible.");
  d.b("Lifting -- attempts exist; fog opacity thins as coverage (share of the topic's questions attempted) and accuracy rise.");
  d.b("Clear -- roughly 80% coverage at 80% accuracy, recency-weighted. Fully lit and permanently navigable.");
  d.b("Creep -- fog partially returns after months of neglect. Spaced-repetition pressure, tuned to nudge revision without punishing.");
  d.note("The creep contract: fog never fully refogs a cleared region. It returns asymptotically toward 40% opacity at most, and a single review session pushes it back. Framing matters: creep is revision pressure, not punishment.");
  d.h2("The zoom ladder");
  d.p("Three levels for v1. (1) The full map: every subject continent on one screen. (2) A subject view: that subject's topics clustered by how real papers group them. (3) A topic sheet: the topic's questions, its articles and sims, and a 'practise this topic' action. Tap to drill in; pinch or scroll to climb out. Desktop gets wheel-zoom; mobile gets pinch; both share one transform model.");
  d.h2("The pathfinder draws the route");
  d.p("Pick a target course (Medicine needs English, Biology, Chemistry, Physics) and the map highlights the regions that combo needs and marks the next uncleared tile on the route. 'What do I study today?' is answered spatially, every day, from the student's own data -- no motivational copy required.");
  d.h2("Architecture");
  d.b("Data: one aggregate query per user -- attempts joined to questions grouped by topic_slug, producing per-topic attempt count, distinct questions covered, correct count, and last-seen. No separate progress table in v1; attempts are the truth.");
  d.b("Layout: a static JSON generated offline by a script. Topics are clustered by co-occurrence in real papers (topics that appear in the same subject-year papers sit near each other); positions are laid out with a deterministic seeded pass so the map never reshuffles.");
  d.b("Rendering: a single <canvas> with a pan/zoom transform. Hit-testing is nearest-tile distance, not DOM. Fog states are computed once per session load and cached; the map redraws on interaction but never re-queries.");
  d.b("API: GET /api/map returns {topics:[{slug, subject, coverage, accuracy, last_seen, n_questions}], layout_version}. ~40 rows per user -- trivially cacheable.");
  d.h2("Edge cases and honest caveats");
  d.b("It is only as good as the topic labels. Every one of the 4,142 questions needs a clean topic_slug; step one is a coverage audit, otherwise we get patches of broken permanent fog. (The topics table exists; the audit is a script + an afternoon of label fixes.)");
  d.b("Right after launch it is mostly fog -- which is correct. Fog needs fog to lift; the map improves as students generate attempts. The empty state must feel like possibility, not emptiness: fogged tiles show the topic NAME and question count, so the map is informative even before the first attempt.");
  d.b("Thin topics (few questions) make coverage unstable -- 1 of 2 questions attempted reads as 50%. Mark those tiles 'survey' tiles that clear on any attempt.");
  d.b("A cheap Android is the target device: one canvas, cached layout, render-once, no blur/shadow on fog -- fog opacity is a single fill, not a filter.");
  d.h2("Build order");
  d.p("1) Topic audit script (coverage + label fixes). 2) Layout generator script writing map-layout.json. 3) Aggregate endpoint + fog math. 4) Canvas map with three zoom levels. 5) Pathfinder route overlay. 6) Creep tuning (last). Estimate: 2-3 weeks of focused work. Fog map is the flagship differentiator and pairs perfectly with the existing Pathfinder.");
  d.hr();

  /* ---- 2. pull-a-step ---- */
  S(2);
  d.h2("The idea");
  d.p("Inside any multi-step constructive, a hold-to-pull affordance reveals the previous step fully worked -- the actual mathematics or scene, not just its title -- then folds away. It is the middle ground between 'locked until you build it' and 'here is the answer', preserving productive struggle while preventing rage-quit.");
  d.h2("Interaction");
  d.b("A small button on the step bar: 'pull a step'. Hold to confirm (600 ms) -- deliberate, not accidental. The previous step's full work appears inline above the current one, tinted as borrowed.");
  d.b("Pulls are bounded: you cannot pull past step 1, and each pull counts. After two pulls the question is marked assisted -- the attempt still records, but stats surface it honestly ('solved with 2 pulls').");
  d.b("Beat-my-path is unaffected: wrong picks still count; pulls are not wrong picks.");
  d.h2("Data model");
  d.b("attempts.pulled integer default 0 (how many pulls this attempt used).");
  d.b("events row kind='step_pulled' {question_id, step} -- feeds the aggregate 'which steps students lean on' view, which becomes authoring signal (a step everyone pulls is a step written badly).");
  d.h2("Risks");
  d.b("Farming pulls to trivialize construction: bounded above (steps-1) and surfaced in stats -- the dishonesty cost is visible to the student themselves.");
  d.b("Scope creep into full hint trees: cut. One pull depth only in v1.");
  d.h2("Build order");
  d.p("Column + events write + UI hold-button + stats surfacing. Estimate: 3-4 days. This is the highest value-per-hour item on this list.");
  d.hr();

  /* ---- 3. lift-out ---- */
  S(3);
  d.h2("The idea");
  d.p("Any question can be lifted out of its paper into a personal tray -- a portable object carrying its explanation, steps, and media links. Lifted questions power revision lists ('my 12 hardest optics questions'), printable sheets, and sharing.");
  d.h2("Interaction");
  d.b("A 'lift out' action in the answered state and on any question sheet. The tray lives in Practice as a tab: lifted questions, grouped by topic, with remove and clear.");
  d.b("Share a lifted collection as a link -- the link re-gates premium: opening a shared tray shows free questions fully and archived ones as the barcode card. Lifting never leaks content.");
  d.b("Printable sheet (v2): the tray renders as a clean exam-style paper with an answer key on the last page. PDF generation reuses the hand-rolled writer from this document.");
  d.h2("Data model");
  d.p("The saved_items table already exists (user_id, item_type, item_id, created_at) -- lift-out is a productization of it: UI, tray view, share link with an id list (zero new tables). A shared tray link is /tray?ids=... exactly like beat-my-path encodes itself in its URL.");
  d.h2("Risks");
  d.b("Tray bloat: cap at 200 lifted items with a friendly 'the tray is full -- lift what you will actually re-open'.");
  d.b("Sharing leaks: solved above by re-gating at read time; the share link never embeds answer data for premium questions beyond what the free tier exposes.");
  d.h2("Build order");
  d.p("Tray UI + lift actions + share link. Estimate: 4-6 days.");
  d.hr();

  /* ---- 4. authoring studio ---- */
  S(4);
  d.h2("The idea");
  d.p("An internal-first authoring surface for the expensive content kinds: constructives (step scenes), blanks (slot grammar), and sim-linked questions. Later it opens to invited authors under the creator program (section 5). The studio's job is to make a 90-minute constructive take 30 minutes, with validation so nothing malformed reaches the table.");
  d.h2("The slot grammar (blanks)");
  d.b("Stem slots are written ___1___, ___2___, ... -- the validator lints: slot numbers sequential from 1, at least two slots, every slot referenced at most once, word bank non-empty, answer a permutation of distinct bank labels with no repeats, and length limits on tokens.");
  d.b("The answer is stored as comma-joined labels ('B,A,D,C') in slot order; grading is kind-aware in /api/attempt and compares arrangement, not letters.");
  d.b("Distractors beyond the slot count are encouraged -- single-use tokens make the bank a real arrangement task.");
  d.h2("Constructive authoring");
  d.b("Steps are typed blocks: text, math (rendered by MathText), scene (JSON scenes rendered by StepScene). The scene schema is FROZEN for authors: a fixed palette of primitives the renderer knows; new primitives are a code change, not author freedom.");
  d.b("Templates cut cost: each subject gets 3-4 constructive skeletons (e.g. 'derive the expression', 'complete the circuit calculation', 'interpret the graph') with pre-set step kinds.");
  d.h2("Pipeline");
  d.b("questions.status: draft -> review -> live (column added; all existing rows backfilled 'live'). The practice surfaces only live; the studio sees everything.");
  d.b("Validation runs on save AND on publish (defense in depth): stem constraints, option counts, answer-label existence, qnum uniqueness per subject-year, topic_slug existence.");
  d.h2("Risks");
  d.b("Authoring cost per constructive is real (30-90 minutes). Templates + reuse of scene primitives are the mitigation; the creator program pays for scale.");
  d.b("Malformed content reaching production: validators + a preview pane that renders the exact student view before publish.");
  d.h2("Build order");
  d.p("Status column + validators + forms (constructive, blanks) + preview. Estimate: 1-2 weeks internal-only. The invite-author layer waits for the creator program.");
  d.hr();

  /* ---- 5. creator program ---- */
  S(5);
  d.h2("The idea");
  d.p("Vetted teachers and top students author questions, articles, and annotations for revenue share: N per accepted question, plus a per-1k-attempts bonus in the first months. The program is how the archive grows past what we author ourselves -- and how the fog map never runs out of territory to clear.");
  d.h2("Mechanics");
  d.b("Application -> vetting (sample question set + a call) -> program profile (payout bank details, subject list) -> authoring via the studio with status='review'.");
  d.b("Acceptance bar: 2 of 3 reviewers approve, with a written rejection reason. Rejections feed the author's next draft -- the loop is the training.");
  d.b("Payout ledger: creator_payouts (creator_id, period, accepted_count, attempts_bonus, amount, status). Monthly cycle, manual review at first (the claims pattern again), automated later.");
  d.h2("Legal and operations");
  d.b("Originality oath + plagiarism screening (existing-stem fuzzy match at submit time: trigram similarity against the archive).");
  d.b("Takedown policy published; payout withheld on any accepted-then-retracted plagiarism case.");
  d.b("Start narrow: 10 creators, 2 subjects, fixed monthly budget. Scale only when acceptance quality stabilizes above 70%.");
  d.h2("Risks");
  d.b("Quality variance -- the acceptance bar and reviewer pool absorb it.");
  d.b("Payout ops -- start manual, like claims review; automate only when volume demands it.");
  d.b("Author churn -- per-author dashboards (acceptance rate, earnings, attempt counts) keep the loop visible.");
  d.h2("Build order");
  d.p("Depends on the authoring studio. Program tables + application flow + review queue + payout ledger. Estimate: 2-3 weeks after the studio.");
  d.hr();

  /* ---- 6. groups & ranks ---- */
  S(6);
  d.h2("The idea");
  d.p("Small study groups (maximum 8) with a weekly ranked mock and a private leaderboard. Groups are the social floor the learn spaces stand on: the same membership, the same invite mechanics, the same trust level -- rooms add the board and the recording on top.");
  d.h2("Mechanics");
  d.b("Join by 6-character invite code. No public profiles, no global leaderboard -- ranking is group-scoped by design (a school leaver in Kano should not be ranked against the entire country in v1).");
  d.b("Weekly mock: each member runs the same sampled paper (30 questions, subject mix per JAMB combo), server-graded as usual; the group view shows total + accuracy per member, and a streak line.");
  d.b("Group thread: lightweight, text-only, react-only. It exists to coordinate the weekly mock and drop beat-my-path links -- not to become a chat app.");
  d.h2("Data model");
  d.b("groups (id, name, invite_code unique, owner_id, created_at); group_members (group_id, user_id, joined_at, role) -- 8-member cap enforced at insert.");
  d.b("Weekly mocks reuse attempts wholesale: a mock session id groups the attempts; the leaderboard is a per-session aggregate query. No new grading logic exists to build.");
  d.h2("Risks");
  d.b("Collusion during ranked mocks: the weekly mock samples fresh questions at runtime from the whole archive (premium-gated members get premium-weighted sampling), so pre-shared answers cannot be prepared. Server-side grading already owns correctness.");
  d.b("Dead groups: groups auto-archive after 30 days without a completed mock, with a revival prompt to the owner.");
  d.h2("Build order");
  d.p("Groups tables + invite codes + weekly mock sampler + group leaderboard view. Estimate: 1-2 weeks. Presence (realtime) arrives with learn spaces; groups deliberately ship without it first.");
  d.hr();

  /* ---- 7. learn spaces ---- */
  S(7);
  d.h2("The idea");
  d.p("A room you enter with other people -- Figma/Notion atmosphere. A shared board fills the space (a question, a passage, a diagram, a sketch canvas, a video frame); participants sit along the edge as small avatars; conversation appears as speech bubbles above the speaker's avatar; every participant has a named, Figma-style pointer. The whole session is recorded as an append-only event log, and replay re-enacts the log in order like a film -- with speed control and scrubbing. A study session becomes content: 'watch how this group unpacked electrolysis' sits on the free/premium shelves exactly like a video or article.");
  d.h2("The two primitives that make it feel alive");
  d.b("Speech bubbles -- messages render as bubbles above the speaker's avatar. The conversation is spatial (who said it, next to what is on the board) instead of a scrolling sidebar.");
  d.b("Pointers -- every participant has a named cursor they can move anywhere on the board. Pointing is the core teaching gesture: circle the failing step, underline the phrase, point at the resistor. The board is shared attention.");
  d.h2("The architectural insight: store events, not snapshots");
  d.p("Every action is an event: {t, actor, kind, payload}. Live mode is the log consumed at t=now; replay is the same log consumed at t=recorded. Replay becomes nearly free, sync is trivial (append + broadcast), and storage is tiny -- one board renderer consumes the log either way.");
  d.h2("The one constraint that collapses the hard part: host-led");
  d.p("The leader adds and moves board objects; everyone else points and talks. Free-for-all concurrent canvases are a CRDT nightmare; host-led is an ordered event log -- which is exactly what replay wants anyway. Host controls: transfer host, remove member, end session. This is a product decision, not a technical surrender: one voice per room is how real tutorials run.");
  d.h2("Data model");
  d.b("rooms (id, title, host_id, subject_slug, topic_slug, status: live/ended, started_at, ended_at, linked_video_id nullable, linked_question_id nullable).");
  d.b("room_events (id bigserial, room_id, seq int monotonic per room, actor uuid, t_ms int offset from session start, kind text, payload jsonb, created_at) -- PRIMARY KEY (room_id, seq).");
  d.b("room_members (room_id, user_id, role: host/member, joined_at, left_at) -- presence history is queryable, which gives attendance and 'rooms you were in'.");
  d.b("Event kinds v1: presence.join, presence.leave, pointer.move {x, y}, bubble.post {text}, board.add {obj}, board.move {obj_id, x, y}, board.remove {obj_id}, reveal.step {n}, room.title {title}.");
  d.b("Board object schema: {id, type: question|passage|diagram|sketch|frame|note, src, x, y, w, h, z} -- sketch is a stroke list; every other type references existing content by id/slug.");
  d.h2("Live sync");
  d.b("Supabase Realtime: one channel per room; board events broadcast; presence via the Realtime presence API (avatars join/leave by themselves).");
  d.b("pointer.move is coalesced client-side (10 Hz, drop-stale) and stored coalesced (>= 100 ms granularity) -- it is the highest-volume event and would otherwise dominate the log.");
  d.b("Writes go through a thin POST /api/rooms/[id]/events that assigns seq monotonically per room (a Postgres sequence per room, or seq = max+1 inside a transaction).");
  d.h2("Recording and replay");
  d.b("Recording is free -- it IS the live log. Nothing extra is captured, which is why v1 rooms must be recordable from day one even before the replay UI exists.");
  d.b("Replay player: consumes the log by seq; scrub by event index; speeds 0.5/1/2/4; bubbles pop above avatars at their t_ms, pointers glide (interpolated between coalesced moves), board objects appear when they appeared.");
  d.b("Replays become shelf content: status='ended' rooms with >N events get a replay card (duration, subject, topic); free/premium gating follows the same is_free GENERATED pattern -- replays from sessions on free content are free.");
  d.h2("Moderation and safety");
  d.b("No DMs. Bubbles are board-scoped and logged BY DESIGN -- the log is the safety tool: report an event, the reviewer sees the exact context.");
  d.b("Report queue reuses the claims admin pattern; host remove-member is instant and logged; blocked-word filter on bubble.post at write time.");
  d.b("Rooms are scoped to subject/topic and capped at 12 participants in v1; the host controls the door (open/invite-code).");
  d.h2("Risks and honest costs");
  d.b("Realtime cost at scale -- fine at launch numbers (dozens of rooms), revisit when hundreds of concurrent rooms exist.");
  d.b("Voice/video is CUT for v1. Audio rides a WhatsApp or Meet call the host shares in the room description; spaces carry visuals, audio lives elsewhere initially. Native voice is a v2 decision gated on usage.");
  d.b("Pointer noise -- coalescing + 10 Hz throttle keeps the log lean and replay smooth.");
  d.b("Moderation load -- host-led plus log-based reporting keeps the surface small; curated public replays are hand-picked at first.");
  d.h2("Build order");
  d.p("1) rooms + room_events + room_members tables (migration). 2) Board renderer (host-led) + avatars. 3) Bubbles + pointers. 4) Recording (free -- same log). 5) Replay player. 6) Shelf integration + curated replays. Estimate: 3-4 weeks for recordable v1, +2 weeks for the replay player. The event schema in this section is final enough to build against.");
  d.hr();

  /* ---- 8. cross-cutting ---- */
  S(8);
  d.h2("Event-sourcing everywhere");
  d.p("The pattern repeats because it is the right pattern: the video quiz thread records {from, to}; learn spaces record room_events; pull-a-step records step_pulled. Append-only events plus derived views keep sync trivial, replay possible, and storage honest. Any new interactive feature should first answer: 'what is my event log?'");
  d.h2("The cheap-Android budget");
  d.b("One canvas, not many DOM nodes, for anything with >50 moving parts (the map; the room board).");
  d.b("One aggregate query per view (the map's per-topic rollup; the group leaderboard). Pagination everywhere else.");
  d.b("No blur/shadow filters on animated surfaces; fog and room backgrounds are flat fills.");
  d.b("Client bundles stay dependency-free beyond what exists today -- Three.js (sims expansion) is the one sanctioned addition.");
  d.h2("Data model additions, all together");
  d.b("Columns: questions.status (draft/review/live, backfilled live); attempts.pulled (int default 0).");
  d.b("Tables: groups + group_members; rooms + room_events + room_members; creator_program + creator_payouts.");
  d.b("Reused as-is: saved_items (lift-out), attempts (fog map, groups), payments (everything commercial), events (interaction log).");
  d.h2("Moderation and safety, one policy");
  d.b("No DMs anywhere in v1; every social surface is logged and reportable.");
  d.b("Reports land in one queue with context attached (the event, the room state, the question).");
  d.b("Premium content never leaks through sharing surfaces -- links re-gate at read time (beat-my-path, lift-out, replays all obey).");
  d.h2("Build order across all of it");
  d.p("P0 (now): fog map -- needs the topic audit, which improves everything else too. P1 (this month): pull-a-step + lift-out -- small, immediate, visible. P2: groups and ranks -- the social floor. P3: authoring studio -- quality pipeline. P4: learn spaces v1 -- recordable rooms. P5: replay player + creator program -- content at scale. Rationale: the fog map is the differentiator students screenshot; the small items buy goodwill in days; rooms need their event schema landed with groups' social trust already proven.");
  d.hr();

  /* ---- 9. decision log ---- */
  S(9);
  d.b("Host-led rooms over CRDT canvases -- ordered events are what replay needs anyway.");
  d.b("Store events, not snapshots -- replay, sync and storage all simplify.");
  d.b("Canvas over DOM for the map -- one render, no reflow, cheap Android survives.");
  d.b("Attempts as the single source of truth for fog -- no parallel progress table to drift out of sync.");
  d.b("URL-encoded social features (beat-my-path, shared trays) -- zero DB, zero moderation surface, WhatsApp-native.");
  d.b("Flutterwave hosted page over dynamic virtual accounts -- verify_by_reference and the verif-hash webhook are reliable, and no schema change is needed.");
  d.b("Kind-aware grading server-side (single/multi/blanks) -- the client never asserts correctness.");
  d.b("is_free GENERATED from year >= 2021 -- the free/premium line is data, never a flag someone forgets to set.");
  d.b("Three.js sanctioned as the one new client dependency -- for the directly interactive sims expansion.");
  d.b("Hand-rolled text-only PDF writers (this document, printable trays) -- no dependency, full control, good enough.");
  d.note("Next implementation sprint after this batch: Three.js interactive simulations and longer videos with fetched transcripts feeding richer annotations. Those designs live in the session notes; this document covers everything deferred beyond them.");

  /* ---- footers + assemble ---- */
  for (let i = 0; i < d.pages.length; i++) {
    if (i === 0) continue; // cover
    const op = d.pages[i];
    op.push(`BT /${F1} 8.5 Tf 1 0 0 1 ${MX} 40 Tm (Past Graph -- research: later features) Tj ET`);
    op.push(`BT /${F2} 8.5 Tf 1 0 0 1 ${(PW - MX - 62).toFixed(2)} 40 Tm (page ${i + 1}) Tj ET`);
  }

  const objs = [];
  const add = (s) => { objs.push(s); return objs.length; };
  const kidsIdx = []; // [pageObjNum, contentObjNum]
  const contentStart = 6; // 1 catalog, 2 pages, 3 F1, 4 F2, 5 F3, then pages
  d.pages.forEach((_, i) => kidsIdx.push(contentStart + i * 2));

  add(`<< /Type /Catalog /Pages 2 0 R >>`);
  add(`<< /Type /Pages /Kids [${kidsIdx.map((k) => `${k} 0 R`).join(" ")}] /Count ${d.pages.length} >>`);
  add(`<< /Type /Font /Subtype /Type1 /BaseFont /${F1} /Encoding /WinAnsiEncoding >>`);
  add(`<< /Type /Font /Subtype /Type1 /BaseFont /${F2} /Encoding /WinAnsiEncoding >>`);
  add(`<< /Type /Font /Subtype /Type1 /BaseFont /${F3} /Encoding /WinAnsiEncoding >>`);
  d.pages.forEach((ops, i) => {
    const content = ops.join("\n");
    const cNum = contentStart + i * 2;
    const pNum = cNum + 1;
    add(`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`);
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${cNum} 0 R >>`);
  });

  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [out.length];
  objs.forEach((o, i) => {
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    offsets.push(out.length);
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i++) out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  return { out, pages: d.pages.length };
}

/* two-pass: pass 1 collects section pages (TOC height identical both passes),
   pass 2 renders the final document with true page numbers */
build();
const numbers = tocPages.slice();
const final = build();

const dest = path.resolve("docs", "research-later-features.pdf");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, Buffer.from(final.out, "latin1"));
console.log(`written: ${dest}  pages: ${final.pages}  bytes: ${fs.statSync(dest).size}`);
console.log(numbers.map((p, i) => `p${p} ${SECTIONS[i].title}`).join(" | "));
