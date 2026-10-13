"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getModel } from "@/generation/catalog";
import { useActive } from "@/generation/stores/active";

import { VIEWS, VIEW_LABELS, type GalleryView } from "./data";
import { AssetsIcon, HeartIcon, ImageIcon, KeyIcon, VideoIcon } from "./icons";
import { ModelIcon } from "./model-icon";

/* Genjutsu has two variants; the shortcut opens the first and stays lit while
   either one is the model in force. */
const SHORTCUTS = [
  {
    label: "Genjutsu",
    model: "genjutsu-motion-transfer",
    hint: "Genjutsu — troca personagens e objetos em um vídeo, mantendo o movimento",
    match: (id: string) => id.startsWith("genjutsu"),
  },
  {
    label: "Marketing Studio",
    model: "marketing-studio-image",
    hint: "Marketing Studio — imagens de campanha até 4K",
    match: (id: string) => id === "marketing-studio-image",
  },
];

const VIEW_ICONS: Record<GalleryView, () => React.ReactNode> = {
  image: () => <ImageIcon />,
  video: () => <VideoIcon />,
  assets: () => <AssetsIcon />,
  favorites: () => <HeartIcon size={15} />,
};

export function Topbar({
  view,
  onView,
  busy,
  keyConfigured,
  onKeys,
}: {
  view: GalleryView;
  onView: (next: GalleryView) => void;
  busy: boolean;
  keyConfigured: boolean;
  onKeys: () => void;
}) {
  const activeModel = useActive((state) => state.model);
  const setModel = useActive((state) => state.setModel);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  /* The indicator is measured rather than derived from equal columns, so it
     morphs to each label's real width instead of padding the short ones. */
  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    let live = true;
    const measure = () => {
      const active = tabs.querySelector<HTMLElement>('[aria-selected="true"]');
      if (live && active) setThumb({ x: active.offsetLeft, w: active.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(tabs);
    // Inter swaps in after first paint and the labels resize under it.
    void document.fonts.ready.then(measure);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [view]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const from = VIEWS.indexOf(view);
      const to =
        event.key === "ArrowRight"
          ? (from + 1) % VIEWS.length
          : event.key === "ArrowLeft"
            ? (from - 1 + VIEWS.length) % VIEWS.length
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? VIEWS.length - 1
                : -1;
      if (to < 0) return;
      event.preventDefault();
      onView(VIEWS[to]!);
      tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[to]?.focus();
    },
    [onView, view],
  );

  return (
    <div className="ohf-topbar">
      <h1 className="ohf-sr">OpenHiggsfield AI — Estúdio de IA de código aberto</h1>

      <div className="ohf-bar ohf-enter-1">
        <div
          className="ohf-tabs"
          role="tablist"
          aria-label="Seção da galeria"
          ref={tabsRef}
          onKeyDown={onKeyDown}
        >
          <span
            className="ohf-thumb"
            data-ready={thumb !== null}
            aria-hidden
            style={
              {
                "--thumb-x": `${thumb?.x ?? 0}px`,
                "--thumb-w": `${thumb?.w ?? 0}px`,
              } as React.CSSProperties
            }
          />
          {VIEWS.map((id) => {
            const selected = view === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`ohf-tab-${id}`}
                aria-selected={selected}
                aria-controls="ohf-panel"
                tabIndex={selected ? 0 : -1}
                className="ohf-tab"
                data-view={id}
                /* Favorites is the one scope that goes icon-only on a narrow
                   pill, so its name is stated rather than left to the mark. */
                aria-label={VIEW_LABELS[id]}
                title={id === "favorites" ? VIEW_LABELS[id] : undefined}
                onClick={() => onView(id)}
              >
                {VIEW_ICONS[id]()}
                <span className="ohf-tab-label">{VIEW_LABELS[id]}</span>
              </button>
            );
          })}
        </div>

        {/* Shortcuts to the featured models, in the same pill as the scopes but
            outside the tablist: one press picks the model, and the scope
            follows it the way it follows the model picker. */}
        <span className="ohf-bar-rule" aria-hidden />
        <div className="ohf-shortcuts" role="group" aria-label="Modelos em destaque">
        {SHORTCUTS.map((shortcut) => {
          const active = shortcut.match(activeModel);
          return (
            <button
              key={shortcut.label}
              type="button"
              className="ohf-tab"
              aria-pressed={active}
              title={shortcut.hint}
              onClick={() => {
                /* The scope switches first — it may pick that surface's first
                   model — and the shortcut's own model lands last. */
                onView(getModel(shortcut.model).surface);
                setModel(shortcut.model);
              }}
            >
              <ModelIcon modelId={shortcut.model} size={15} />
              <span className="ohf-tab-label">{shortcut.label}</span>
            </button>
          );
        })}
        </div>
      </div>

      {/* Generations run on the visitor's own platform key, so this both states
          whether one is held and opens the modal that sets it — and its lamp is
          the studio's liveness, the one place accent moves. */}
      <div className="ohf-bar ohf-enter-1">
        <button
          type="button"
          className="ohf-key"
          data-busy={busy}
          data-ready={keyConfigured}
          onClick={onKeys}
          aria-label={keyConfigured ? "Editar chave da plataforma" : "Adicionar chave da plataforma"}
          title={keyConfigured ? "Editar chave da plataforma" : "Adicionar chave da plataforma"}
        >
          <KeyIcon />
          <span className="ohf-key-text">{keyConfigured ? "Sua chave" : "Adicionar chave"}</span>
          <span className="ohf-lamp" />
        </button>
      </div>
    </div>
  );
}
