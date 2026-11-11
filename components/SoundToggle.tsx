"use client";

import { useEffect, useState } from "react";
import { isMuted, setMuted, sfx, sfxInit } from "@/lib/sfx";

export default function SoundToggle() {
  const [muted, setM] = useState(false);

  useEffect(() => { setM(isMuted()); }, []);

  return (
    <button
      className="sound-toggle"
      aria-pressed={!muted}
      aria-label={muted ? "Sound off" : "Sound on"}
      title={muted ? "Sound off" : "Sound on"}
      onClick={() => {
        const next = !muted;
        setMuted(next);
        setM(next);
        if (!next) { sfxInit(); sfx("tick"); }
      }}
    >
      {muted ? "Sound off" : "Sound on"}
    </button>
  );
}
