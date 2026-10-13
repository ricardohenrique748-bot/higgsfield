import type { MediaRole, ModelEntry, Surface } from "@/generation/catalog";

export const SURFACES: readonly Surface[] = ["image", "video"];

export const SURFACE_LABELS: Record<Surface, string> = {
  image: "Imagem",
  video: "Vídeo",
};

/** What the gallery is scoped to. "assets" is every run, both surfaces;
    "favorites" is every run the visitor kept, both surfaces. */
export type GalleryView = Surface | "assets" | "favorites";

/** Scopes that span both surfaces, so switching to them leaves the model alone. */
export const CROSS_VIEWS = new Set<GalleryView>(["assets", "favorites"]);

export const VIEWS: readonly GalleryView[] = ["image", "video", "assets", "favorites"];

export const VIEW_LABELS: Record<GalleryView, string> = {
  ...SURFACE_LABELS,
  assets: "Arquivos",
  favorites: "Favoritos",
};

export const PROMPT_PLACEHOLDERS: Record<Surface, string> = {
  image: "Descreva a imagem — tema, estilo, luz, lente…",
  video: "Descreva a cena — tema, movimento de câmera, luz, ritmo…",
};

/* The pool the empty state draws from. Each line is a whole prompt — subject,
   light, lens or camera move — so a click loads something worth pressing
   Generate on rather than a fragment to finish. */
export const SAMPLES: Record<Surface, string[]> = {
  image: [
    "Retrato de um apicultor em um pomar ensolarado, filme médio formato, pouca profundidade de campo",
    "Corte isométrico de um pequeno estúdio de gravação, luz de tungstênio quente, render fosco em argila",
    "Still life editorial: vasos de concreto brutalista com papoulas silvestres, sombras duras do meio-dia",
    "Beco molhado de chuva à meia-noite, lâmpadas de sódio, reflexos em cada poça, 35mm",
    "Retrato em estúdio de um luthier idoso segurando um violino inacabado, um único softbox, fundo preto",
    "Vista aérea de cima de salinas, geometria rosa e ocre, nitidez do meio-dia",
    "Ilustração em corte do mecanismo de um relógio mecânico, linhas de planta técnica em papel amarelado",
    "Casa modernista tomada por samambaias, luz nublada, detalhe de grande formato",
    "Xícara de espresso em cerâmica fosca sobre ardósia molhada, luz de contorno, vapor congelado no meio da espiral",
    "Interior de chalé de esqui dos anos 70, painéis de madeira e lã laranja, sol baixo de inverno pelo vidro",
    "Mãos sovando massa sobre mármore enfarinhado, luz de janela, paleta suave, enquadramento fechado",
    "Observatório no deserto na hora azul, longa exposição, rastros de estrelas sobre uma cúpula branca",
  ],
  video: [
    "Dolly aéreo lento sobre um pinheiral coberto de neblina ao amanhecer, luz volumétrica atravessando as copas",
    "Plano macro de tinta se espalhando na água, contraluz, câmera ultralenta, fundo preto",
    "Travelling com câmera na mão por um mercado de neon à noite, chuva na lente, foco raso",
    "Plano fixo de uma lanchonete às 3 da manhã, um único cliente, chuva lá fora, letreiro piscando",
    "Aproximação lenta nas mãos de um escultor moldando argila molhada, luz suave de janela",
    "Drone orbitando um farol em mar agitado, mar cinzento, respingos atingindo a lente",
    "Timelapse de sombras de nuvens varrendo a borda de um cânion, da hora dourada ao anoitecer",
    "Steadicam caminhando por uma estufa vazia, poeira nos feixes de luz, revelação lenta",
    "Chicote de câmera de um disco girando para uma dançarina no meio do giro, brilho de tungstênio, muito motion blur",
    "Plano subaquático de um nadador rompendo a superfície, bolhas, luz do sol refratando",
    "Plano aberto estático de um trem cruzando um viaduto ao entardecer, janelas acesas, compressão de teleobjetiva",
    "Tilt lento descendo a fachada de vidro de uma torre até uma faixa de pedestres movimentada, luz nublada da cidade",
  ],
};

/** A few of the pool in a fresh order, so two visits are not handed the same
    shelf. Called on the client only — picking during render would give the
    server a different set than the hydrating client. */
export function pickSamples(surface: Surface, count = 3): string[] {
  const pool = [...SAMPLES[surface]];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, count);
}

const SETTING_LABELS: Record<string, string> = {
  aspectRatio: "Proporção",
  resolution: "Resolução",
  outputFormat: "Formato",
  duration: "Duração",
  generateAudio: "Gerar áudio",
  batchSize: "Quantidade",
  enhancePrompt: "Melhorar prompt",
  thinking: "Raciocínio",
  numImages: "Imagens",
  sound: "Som",
  cfgScale: "CFG",
  multiShots: "Multicenas",
  keepOriginalSound: "Manter som original",
  characterOrientation: "Orientação",
  quality: "Qualidade",
};

/* A pill carries one word; "Generate audio" is a panel label, not a control on
   a crowded rail. Only keys that read badly at pill length appear here. */
const SETTING_PILL_LABELS: Record<string, string> = {
  generateAudio: "Áudio",
  enhancePrompt: "Melhorar",
  keepOriginalSound: "Som original",
};

export function settingLabel(key: string): string {
  return (
    SETTING_LABELS[key] ??
    key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())
  );
}

export function settingPillLabel(key: string): string {
  return SETTING_PILL_LABELS[key] ?? settingLabel(key);
}

/* Values arrive in the platform's own casing. Only the units conventionally
   set in caps are lifted; "720p" and "16:9" are already how they are written. */
export function settingValueLabel(key: string, value: unknown): string {
  if (typeof value === "boolean") return value ? "Ligado" : "Desligado";
  if (typeof value === "number") return key === "duration" ? `${value}s` : String(value);
  const text = String(value);
  if (text === "auto") return "Auto";
  if (/^\d+k$/.test(text)) return text.toUpperCase();
  if (key === "outputFormat") return text.toUpperCase();
  if (key === "quality") return { low: "Baixa", medium: "Média", high: "Alta" }[text] ?? text;
  if (key === "characterOrientation") return text === "video" ? "Vídeo" : text === "image" ? "Imagem" : text;
  return text;
}

export const ROLE_LABELS: Record<MediaRole, string> = {
  start: "Quadro inicial",
  end: "Quadro final",
  reference: "Referência",
  video: "Vídeo",
  audio: "Áudio",
};

/* Slate tags for the attachment tiles, where the full label will not fit. */
export const ROLE_TAGS: Record<MediaRole, string> = {
  start: "INÍCIO",
  end: "FIM",
  reference: "REF",
  video: "VÍDEO",
  audio: "ÁUDIO",
};

/* What a role can hold, in the coarser unit the asset library sorts by. The
   accept string above is the file dialog's business; this is the picker's. */
export type AssetKind = "image" | "video" | "audio";

export const ROLE_KINDS: Record<MediaRole, AssetKind> = {
  start: "image",
  end: "image",
  reference: "image",
  video: "video",
  audio: "audio",
};

/* The picker's confirm button names what it attaches — "Add 2 references",
   "Add start frame" — so each role carries its plural rather than taking an s. */
const ROLE_PLURALS: Record<MediaRole, string> = {
  start: "quadros iniciais",
  end: "quadros finais",
  reference: "referências",
  video: "clipes",
  audio: "faixas de áudio",
};

export function roleNoun(role: MediaRole, count: number): string {
  return count === 1 ? ROLE_LABELS[role].toLowerCase() : ROLE_PLURALS[role];
}

/* Mirrors the allow-list in src/app/api/blob/route.ts. */
export const ROLE_ACCEPT: Record<MediaRole, string> = {
  start: "image/jpeg,image/png,image/webp,image/gif",
  end: "image/jpeg,image/png,image/webp,image/gif",
  reference: "image/jpeg,image/png,image/webp,image/gif",
  video: "video/mp4",
  audio: "audio/wav,audio/x-wav",
};

export function rolesOf(model: ModelEntry): MediaRole[] {
  return Object.keys(model.roles) as MediaRole[];
}

export function defaultRole(model: ModelEntry): MediaRole {
  if (model.surface === "image" && model.roles.reference) return "reference";
  if (model.roles.start) return "start";
  return rolesOf(model)[0] ?? "reference";
}

const RATIO = /^(\d+):(\d+)$/;

/** The mini rectangle a ratio value draws, scaled into a 14px optical box —
    null when the value is not a ratio ("auto"), so the caller can reserve the
    slot or draw a plain frame instead. */
export function ratioBox(value: string): { width: number; height: number } | null {
  const match = RATIO.exec(value);
  if (!match) return null;
  const w = Number(match[1]);
  const h = Number(match[2]);
  const scale = 14 / Math.max(w, h);
  return { width: Math.max(5, Math.round(w * scale)), height: Math.max(5, Math.round(h * scale)) };
}

export function ratioToCss(value: unknown, fallback: string): string {
  const match = RATIO.exec(String(value ?? ""));
  return match ? `${match[1]} / ${match[2]}` : fallback;
}

/* Two roles share one word — a start and an end frame are both frames — so the
   phrases dedupe before they are listed. */
const ROLE_PHRASES: Record<MediaRole, string> = {
  start: "quadros",
  end: "quadros",
  reference: "referências",
  video: "clipes",
  audio: "áudio",
};

function joinPhrases(parts: string[]): string {
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} ou ${parts[parts.length - 1]}`;
}

/** The line under a model's name in the picker, derived from the entry itself:
    what it makes, what it takes, where its allow-lists top out. The catalog
    stays the only place a model's truth is written down. */
export function describeModel(model: ModelEntry): string {
  const noun = model.surface === "image" ? "Imagens" : "Vídeo";
  const inputs = [...new Set(rolesOf(model).map((role) => ROLE_PHRASES[role]))];
  const source = inputs.length
    ? `${noun} a partir de prompt, ${joinPhrases(inputs)}`
    : `${noun} a partir de prompt`;

  const limits: string[] = [];
  const resolution = model.settings.resolution;
  /* The catalog declares resolutions in ascending order, so the ceiling is the
     last value it lists. */
  if (resolution?.type === "enum" && resolution.values.length > 0) {
    const top = resolution.values[resolution.values.length - 1]!;
    limits.push(`até ${settingValueLabel("resolution", top)}`);
  }
  const duration = model.settings.duration;
  if (duration?.type === "range") limits.push(`${duration.min}–${duration.max}s`);

  return limits.length ? `${source} · ${limits.join(", ")}` : source;
}

/* Keys that already mean "results per request". The composer shows one batch
   control whatever the model is: where the catalog declares one of these it
   writes the setting and the platform answers with that many media; every
   other model is submitted once per result. A key named here is claimed by the
   batch control and never also drawn as a settings pill, so the studio's count
   and the model's own can never disagree. */
export const COUNT_KEYS = ["numImages", "batchSize"];

export type CountSetting = {
  key: string;
  /** How the value is written back: an enum stores the count as the string the
      catalog declared, a range stores it as a number. */
  kind: "enum" | "range";
  /** Every count the model allows, ascending. The control walks this list, so a
      model offering only 1 or 4 can never be left on an illegal 2. */
  counts: number[];
};

export function countSetting(model: ModelEntry): CountSetting | null {
  for (const key of COUNT_KEYS) {
    const field = model.settings[key];
    if (field?.type === "range") {
      const counts: number[] = [];
      for (let n = field.min; n <= field.max; n++) counts.push(n);
      return { key, kind: "range", counts };
    }
    if (field?.type === "enum") {
      const counts = field.values.map(Number).filter(Number.isInteger).sort((a, b) => a - b);
      if (counts.length > 0) return { key, kind: "enum", counts };
    }
  }
  return null;
}

/* The two or three facts that summarise a run at a glance, in the same casing
   the settings panel and the viewer write them — the grid draws these as
   separate chips by splitting on the separator. */
export function metaOf(model: ModelEntry, values: Record<string, unknown>): string {
  const label = (key: string) =>
    values[key] === undefined ? null : settingValueLabel(key, values[key]);
  const parts =
    model.surface === "image"
      ? [label("resolution"), label("outputFormat")]
      : [label("resolution"), label("duration"), values.generateAudio === true ? "Áudio" : null];
  return parts.filter(Boolean).join(" · ");
}

export function durationBadge(values: Record<string, unknown>): string | undefined {
  if (typeof values.duration !== "number") return undefined;
  return formatClock(values.duration);
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.max(0, Math.round(totalSeconds - m * 60));
  return `${m}:${String(s).padStart(2, "0")}`;
}
