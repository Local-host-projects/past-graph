/**
 * commit-push.mjs — session helper: remove temp diagnostics, commit all work,
 * push to origin main. Output streams to the shell capture.
 */
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";

const run = (cmd, args) => {
  try {
    const out = execFileSync(cmd, args, { encoding: "utf8", cwd: process.cwd(), windowsHide: true });
    console.log(`$ ${cmd} ${args.join(" ")}\n${out.trim()}`);
    return out;
  } catch (e) {
    console.log(`$ ${cmd} ${args.join(" ")} FAILED\n${String(e.stderr ?? e).slice(0, 800)}`);
    throw e;
  }
};

/* temp diagnostics created during this session */
for (const f of ["spawn-dev-log.mjs", "dev-verbose.mjs", "wipe-next.mjs", "kill-port.cmd"]) {
  try { rmSync(f, { force: true }); console.log("removed", f); } catch {}
}

run("git", ["add", "-A"]);
const status = run("git", ["status", "--short"]);
if (!status.trim()) { console.log("nothing to commit"); process.exit(0); }
run("git", ["commit", "-m",
  "Expand content, free/premium shelves, server-owned attempts, watcher quiz fixes\n\n" +
  "- 242 new questions (economics papers 2021-2025 + physics/chem/bio/math banks), 22 articles, premium allowlist split\n" +
  "- /api/me returns userId; /api/attempt POST computes correct server-side, GET ?ids= prefills the sheet\n" +
  "- Watcher: quiz checkpoints fire on section crossing; wrong answer offers return-to-timestamp\n" +
  "- Feed: quiz-checkpoint chips + attempted prefill normalization\n" +
  "- Sims: punnett/demand/snell kinds (component + types + schema/upgrade SQL)\n" +
  "- Pricing copy rewritten around the free/premium split\n" +
  "- VideoStage: YT player needs enablejsapi + origin (current widgetapi builds refuse otherwise)"
]);
run("git", ["push", "origin", "main"]);
console.log("PUSH OK");
