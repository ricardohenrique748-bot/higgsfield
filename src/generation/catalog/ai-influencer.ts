import type { ModelEntry } from "./types";

/* Character sheet (portrait + full body). The prompt is sent as the `brief`;
   an optional start image seeds the character. */
export const aiInfluencer: ModelEntry = {
  id: "ai-influencer",
  surface: "image",
  label: "AI Influencer",
  roles: { start: 1 },
  settings: {},
};
