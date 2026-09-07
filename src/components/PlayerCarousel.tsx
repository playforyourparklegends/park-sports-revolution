import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

const CARD_COUNT = 5;
const START_INDEX = 2;

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

export function PlayerCarousel() {
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
    setActive((prev) => (prev === nearest ? prev : nearest));

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const d = i - pos;
      const t = Math.max(0, 1 - Math.abs(d));
      const side = d < 0 ? -1 : 1;
      const inv = 1 - t;
      const depth = card.querySelector<HTMLElement>("[data-depth]");
      const veil = card.querySelector<HTMLElement>("[data-veil]");
      const floor = card.querySelector<HTMLElement>("[data-floor]");
      if (depth) {
        depth.style.transform = `translateZ(${-120 * inv}px) rotateY(${side * -14 * inv}deg) scale(${0.9 + 0.1 * t})`;
        depth.style.opacity = String(0.6 + 0.4 * t);
        depth.style.filter = `blur(${1.5 * inv}px)`;
        depth.style.boxShadow = [
          `inset 0 1px 0 0 rgba(255,255,255,${(0.08 + 0.02 * t).toFixed(3)})`,
          `0 ${20 + 20 * t}px ${40 + 40 * t}px -20px #000`,
          `0 0 ${30 + 30 * t}px -20px var(--gold)`,
        ].join(", ");
      }
      if (veil) veil.style.opacity = String(0.4 * inv);
      if (floor) floor.style.opacity = String(t);
    });
  }, [stepWidth]);

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
  }, [applyDepth, stepWidth]);

  const scrollToIndex = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const idx = Math.max(0, Math.min(CARD_COUNT - 1, i));
      track.scrollTo({ left: idx * stepWidth(), behavior: reduced ? "auto" : "smooth" });
    },
    [reduced, stepWidth],
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
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[27vw] py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Array.from({ length: CARD_COUNT }).map((_, i) => {
          const isActive = i === active;
          const isFlipped = isActive && flipped;
          return (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Card ${i + 1} of ${CARD_COUNT}`}
              className="relative aspect-3/4 w-[46vw] shrink-0 snap-center [perspective:1000px]"
            >
              <div
                data-depth
                className="relative h-full w-full rounded-3xl [transform-style:preserve-3d]"
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
                  />
                  <CardFace
                    reduced={reduced}
                    visible={isFlipped}
                    ariaHidden={!isFlipped}
                  />
                </div>

                {isActive && (
                  <button
                    type="button"
                    aria-label="Flip card"
                    onClick={() => setFlipped((f) => !f)}
                    className="absolute right-3 bottom-3 z-20 inline-flex items-center gap-1 rounded-full border border-gold/50 bg-background/70 px-2.5 py-1.5 text-gold"
                  >
                    <RotateCcw className="size-3.5" />
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

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent"
      />

      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Previous card"
          disabled={active === 0}
          onClick={() => scrollToIndex(active - 1)}
          className="text-gold/70 disabled:opacity-25"
        >
          &#8249;
        </button>
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to card ${i + 1}`}
            aria-current={i === active}
            onClick={() => scrollToIndex(i)}
            className={`size-1.5 rounded-full ${i === active ? "bg-gold" : "bg-gold/30"}`}
          />
        ))}
        <button
          type="button"
          aria-label="Next card"
          disabled={active === CARD_COUNT - 1}
          onClick={() => scrollToIndex(active + 1)}
          className="text-gold/70 disabled:opacity-25"
        >
          &#8250;
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        Card {active + 1} of {CARD_COUNT}
      </p>
    </div>
  );
}

function CardFace({
  back,
  hidden,
  ariaHidden,
  reduced,
}: {
  back: boolean;
  hidden: boolean;
  ariaHidden: boolean;
  reduced: boolean;
}) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/60 via-gold/10 to-gold/50 p-[1px] [backface-visibility:hidden]"
      style={{
        transform: back && !reduced ? "rotateX(180deg)" : undefined,
        opacity: reduced ? (hidden ? 0 : 1) : 1,
        pointerEvents: hidden ? "none" : undefined,
        transition: reduced ? "opacity 300ms ease-out" : undefined,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 60%)",
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-display text-5xl tracking-[0.1em] text-gold/25"
        >
          L
        </span>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.10), rgba(255,255,255,0) 45%)",
          }}
        />
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
