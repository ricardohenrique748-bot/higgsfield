import type { ModelEntry } from "./types";

/* The output runs as long as the source clip (4–30s), so there is no duration
   or ratio to set — only the clip, the references and the resolution. */
const genjutsuSettings = {
  resolution: { type: "enum", values: ["480p", "720p", "1080p"], default: "720p" },
} as const satisfies ModelEntry["settings"];

export const genjutsuMotionTransfer: ModelEntry = {
  id: "genjutsu-motion-transfer",
  surface: "video",
  label: "Genjutsu Motion Transfer",
  roles: { video: 1, reference: 8 },
  settings: genjutsuSettings,
};

export const genjutsuObjectSwap: ModelEntry = {
  id: "genjutsu-object-swap",
  surface: "video",
  label: "Genjutsu Object Swap",
  roles: { video: 1, reference: 8 },
  settings: genjutsuSettings,
};
