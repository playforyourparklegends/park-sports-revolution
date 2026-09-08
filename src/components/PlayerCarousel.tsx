import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { AmbassadorCard } from "@/lib/ambassadors.functions";

const PLACEHOLDER_COUNT = 5;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function PlayerCarousel({ cards }: { cards?: AmbassadorCard[] | undefined }) {
  const items: Array<AmbassadorCard | null> =
    cards && cards.length > 0 ? cards : Array.from({ length: PLACEHOLDER_COUNT }, () => null);
  const CARD_COUNT = items.length;
  const START_INDEX = Math.floor(CARD_COUNT / 2);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(START_INDEX);
  const [flipped, setFlipped] = useState(false);
  const reduced = usePrefersReducedMotion();

  // pointer drag state
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startScroll: 0,
    dx: 0,
    dy: 0,
    axis: "" as "" | "x" | "y",
    t0: 0,
  });

  const stepWidth = useCallback(() => {
    const track = trackRef.current;
    const card = cardRefs.current[0];
    if (!track || !card) return 1;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return card.offsetWidth + gap;
  }, []);

  const applyDepth = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = stepWidth();
    const pos = track.scrollLeft / step;
    const nearest = Math.max(0, Math.min(CARD_COUNT - 1, Math.round(pos)));
    setActive((prev) => {
      if (prev !== nearest) setFlipped(false);
      return prev === nearest ? prev : nearest;
    });

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const d = i - pos;
      const t = Math.max(0, 1 - Math.abs(d));
      const side = d < 0 ? -1 : 1;
      const inv = 1 - t;
      const depth = card.querySelector<HTMLElement>("[data-depth]");
      const veils = card.querySelectorAll<HTMLElement>("[data-veil]");
      const floor = card.querySelector<HTMLElement>("[data-floor]");
      if (depth) {
        depth.style.transform = `translateZ(${-120 * inv}px) rotateY(${side * -14 * inv}deg) scale(${0.9 + 0.1 * t})`;
        depth.style.opacity = String(0.6 + 0.4 * t);
        depth.style.filter = `blur(${1.5 * inv}px)`;
        depth.style.setProperty("--drop-y", `${20 + 20 * t}px`);
        depth.style.setProperty("--drop-blur", `${40 + 40 * t}px`);
        depth.style.setProperty("--gold-blur", `${26 + 28 * t}px`);
      }
      veils.forEach((veil) => (veil.style.opacity = String(0.4 * inv)));
      if (floor) floor.style.opacity = String(t);
    });
  }, [stepWidth, CARD_COUNT]);

  const onScroll = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyDepth();
    });
  }, [applyDepth]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = START_INDEX * stepWidth();
    applyDepth();
    const onResize = () => applyDepth();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyDepth, stepWidth, START_INDEX]);

  const scrollToIndex = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const idx = Math.max(0, Math.min(CARD_COUNT - 1, i));
      track.scrollTo({ left: idx * stepWidth(), behavior: reduced ? "auto" : "smooth" });
    },
    [reduced, stepWidth, CARD_COUNT],
  );

  const onPointerDown = (e: React.PointerEvent, index: number) => {
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      active: e.pointerType !== "touch",
      startX: e.clientX,
      startY: e.clientY,
      startScroll: track.scrollLeft,
      dx: 0,
      dy: 0,
      axis: "",
      t0: performance.now(),
    };
    if (index !== active) drag.current.axis = "x";
  };

  const onPointerMove = (e: React.PointerEvent, index: number) => {
    // gloss tracking
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--y", `${((e.clientY - r.top) / r.height) * 100}%`);

    const d = drag.current;
    if (!d.t0) return;
    d.dx = e.clientX - d.startX;
    d.dy = e.clientY - d.startY;
    if (!d.axis && Math.abs(d.dy) > 8 && Math.abs(d.dy) > Math.abs(d.dx) && index === active) {
      d.axis = "y";
      d.active = false; // cancel horizontal drag
    } else if (!d.axis && Math.abs(d.dx) > 8) {
      d.axis = "x";
    }
    if (d.active && d.axis === "x" && trackRef.current) {
      trackRef.current.scrollLeft = d.startScroll - d.dx;
    }
  };

  const onPointerUp = (index: number) => {
    const d = drag.current;
    const dt = Math.max(1, performance.now() - d.t0);
    if (index === active && Math.abs(d.dy) > Math.abs(d.dx)) {
      const vy = Math.abs(d.dy) / dt;
      if (Math.abs(d.dy) > 50 || vy > 0.4) setFlipped((f) => !f);
    } else if (d.active && d.axis === "x") {
      scrollToIndex(Math.round((trackRef.current?.scrollLeft ?? 0) / stepWidth()));
    }
    drag.current = { ...d, active: false, axis: "", t0: 0, dx: 0, dy: 0 };
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Legends player cards"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") scrollToIndex(active - 1);
        if (e.key === "ArrowRight") scrollToIndex(active + 1);
      }}
      className="relative w-full outline-none"
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{ touchAction: "pan-x", perspective: "1000px" }}
        className="flex snap-x snap-mandatory gap-[1.5vw] overflow-x-auto overscroll-x-contain px-[38vw] py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((card, i) => {
          const isActive = i === active;
          const isFlipped = isActive && flipped;
          return (
            <div
              key={card?.id ?? i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={card ? `${card.display_name}, ${card.day_job_title}` : `Card ${i + 1} of ${CARD_COUNT}`}
              className="relative aspect-5/6 w-[22vw] shrink-0 snap-center [perspective:1000px]"
            >
              <div
                data-depth
                className="card-depth relative h-full w-full rounded-3xl [transform-style:preserve-3d]"
                style={{ transition: reduced ? "none" : "box-shadow 300ms ease-out" }}
              >
                <div
                  className="relative h-full w-full"
                  onPointerDown={(e) => onPointerDown(e, i)}
                  onPointerMove={(e) => onPointerMove(e, i)}
                  onPointerUp={() => onPointerUp(i)}
                  onPointerCancel={() => onPointerUp(i)}
                >
                  <CardFace
                    reduced={reduced}
                    visible={!isFlipped}
                    ariaHidden={isFlipped}
                    imageSrc={card?.apparel_photo_url ?? undefined}
                    imageAlt={card ? `${card.display_name} in Lorenzi Park Lyons apparel` : undefined}
                    caption={card?.display_name}
                  />
                  <CardFace
                    reduced={reduced}
                    visible={isFlipped}
                    ariaHidden={!isFlipped}
                    imageSrc={card?.day_job_photo_url ?? undefined}
                    imageAlt={card ? `${card.display_name} at work as a ${card.day_job_title}` : undefined}
                    caption={card?.day_job_title}
                  />
                </div>

                {isActive && (
                  <button
                    type="button"
                    aria-label="Flip card"
                    onClick={() => setFlipped((f) => !f)}
                    className="absolute right-1.5 bottom-1.5 z-20 inline-flex items-center rounded-full border border-gold/50 bg-background/70 p-1 text-gold"
                  >
                    <RotateCcw className="size-2.5" />
                  </button>
                )}
              </div>
              <div
                data-floor
                aria-hidden
                className="pointer-events-none absolute -bottom-3 left-1/2 h-6 w-4/5 -translate-x-1/2 rounded-[50%] blur-md"
                style={{ background: "radial-gradient(ellipse, var(--gold), transparent 70%)", opacity: 0 }}
              />
            </div>
          );
        })}
      </div>



      <p aria-live="polite" className="sr-only">
        Card {active + 1} of {CARD_COUNT}
      </p>
    </div>
  );
}

function CardFace({
  visible,
  ariaHidden,
  reduced,
  imageSrc,
  imageAlt,
  caption,
}: {
  visible: boolean;
  ariaHidden: boolean;
  reduced: boolean;
  imageSrc?: string | undefined;
  imageAlt?: string | undefined;
  caption?: string | undefined;
}) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="card-metal-frame absolute inset-0 rounded-3xl p-[1px]"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? undefined : "none",
        transition: reduced ? "opacity 150ms ease-out" : "opacity 525ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="card-lacquer relative h-full w-full overflow-hidden rounded-3xl bg-background">
        {imageSrc && (
          <img
            src={imageSrc}
            alt={imageAlt ?? ""}
            loading="lazy"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
          />
        )}
        <div
          aria-hidden
          className="card-tonal-falloff pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden
          className="card-edge-light pointer-events-none absolute inset-0 rounded-3xl"
        />
        <div
          aria-hidden
          className="card-reflection pointer-events-none absolute inset-0 mix-blend-screen"
        />
        {caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent px-1 pb-1 pt-4 text-center">
            <p className="truncate font-display text-[7px] leading-tight tracking-wide text-gold">{caption}</p>
          </div>
        )}
        <div
          data-veil
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-background"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
}
