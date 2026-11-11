const yid = "BLYoyLcdGPc";

async function tryPlain() {
  const res = await fetch(`https://www.youtube.com/watch?v=${yid}&hl=en&has_verified=1`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept-Language": "en" },
    signal: AbortSignal.timeout(25000),
  });
  const text = await res.text();
  console.log("=== plain status", res.status, "len", text.length);
  const ms = text.match(/"approxDurationMs":"(\d+)"/);
  const ls = text.match(/"lengthSeconds":"(\d+)"/);
  console.log("approxDurationMs:", ms && ms[1], "| lengthSeconds:", ls && ls[1]);
  if (!ms && !ls) console.log(text.slice(0, 500));
}

async function tryInnertube() {
  const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({
      context: { client: { clientName: "WEB", clientVersion: "2.20240101.00.00", hl: "en" } },
      videoId: yid,
    }),
    signal: AbortSignal.timeout(25000),
  });
  const text = await res.text();
  console.log("=== innertube status", res.status, "len", text.length);
  let ls = null;
  try {
    ls = JSON.parse(text)?.videoDetails?.lengthSeconds ?? null;
  } catch {
    console.log(text.slice(0, 400));
  }
  console.log("lengthSeconds:", ls);
}

await tryPlain();
await tryInnertube();
