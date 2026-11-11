import { spawn } from "node:child_process";

const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--port", "3000"],
  {
    cwd: process.cwd(),
    detached: true,
    stdio: ["ignore", "ignore", "ignore"],
    windowsHide: true,
  }
);
child.unref();
console.log("spawned detached next dev, pid", child.pid);
process.exit(0);
