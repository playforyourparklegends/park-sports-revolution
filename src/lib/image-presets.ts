/**
 * Reusable Legends of the Park image-generation presets.
 *
 * Client-safe: contains only prompt text and layout numbers, no API keys.
 * Pair with POST /api/generate-image (see src/routes/api/generate-image.ts).
 *
 * Usage:
 *   const body = buildImageRequest("hero", {
 *     subject: "a translucent bronze champion above Lorenzi Park at sunset",
 *   });
 *   await fetch("/api/generate-image", { method: "POST", body: JSON.stringify(body) });
 */

export type ImagePresetId = "hero" | "poster";

/** Brand rules applied to every preset. Keep these in sync with the app's look. */
export const BRAND_STYLE = [
  "Legends of the Park visual identity: prestigious, adult, cinematic sports-heritage tone.",
  "Palette: near-black shadows, deep charcoal, antique gold and warm bronze highlights only.",
  "Lighting: dramatic stormy sky with a low warm sunset rim light; deep contrast, no flat daylight.",
  "Finish: 4K photorealistic, film-grade color grading, no illustration or cartoon styling.",
].join(" ");

/** Rules applied to every preset so generated art stays usable as app artwork. */
export const GLOBAL_CONSTRAINTS = [
  "No text, lettering, numbers, logos, crests, watermarks or signatures anywhere in the image.",
  "No visible spectators, crowds or bystanders unless explicitly requested.",
  "No borders, frames, collage panels, UI elements or split screens.",
  "Composition must be clean and uncluttered, never busy or noisy.",
].join(" ");

export interface ImagePreset {
  id: ImagePresetId;
  label: string;
  /** What this format is for, in plain language. */
  purpose: string;
  /** Target output aspect ratio, stated to the model. */
  aspect: string;
  /** Intended pixel footprint for downstream cropping/export. */
  size: { width: number; height: number };
  /** Framing and layout instructions unique to this format. */
  layout: string;
  /** Extra restrictions on top of GLOBAL_CONSTRAINTS. */
  constraints?: string;
}

export const IMAGE_PRESETS: Record<ImagePresetId, ImagePreset> = {
  hero: {
    id: "hero",
    label: "Hero — tall phone screen",
    purpose:
      "Full-screen vertical background behind a park team home screen, with app content layered over the lower half.",
    aspect: "9:16 tall vertical portrait",
    size: { width: 768, height: 1376 },
    layout: [
      "Vertical full-bleed background photographed from an elevated, slightly aerial vantage point.",
      "Wide open stormy sky fills the upper third; the distant horizon and mountain line sit near the middle of the frame.",
      "Any focal subject stays small and distant, centered, roughly 18-22% of total frame height, with its base meeting the horizon line.",
      "The lower half of the frame is calm, dark and visually quiet park ground so overlaid cards and navigation stay legible.",
    ].join(" "),
    constraints:
      "Nothing bright, detailed or high-contrast in the bottom third of the frame; keep it deep and shadowed.",
  },
  poster: {
    id: "poster",
    label: "Poster — portrait",
    purpose:
      "Print-style vertical poster for match-day announcements, roster reveals and season art.",
    aspect: "2:3 portrait poster",
    size: { width: 1024, height: 1536 },
    layout: [
      "Centered heroic subject, framed from the waist or chest up, occupying roughly 55-65% of frame height.",
      "Subject sits slightly above center with deliberate empty headroom at the top for a title to be added later.",
      "Background is a simplified, darkened park or stadium environment with strong atmospheric depth and gold rim lighting.",
      "Clear quiet band across the bottom fifth of the frame reserved for later captions.",
    ].join(" "),
    constraints: "Do not draw any title, date, caption or team name — those spaces stay empty.",
  },
};

export const IMAGE_PRESET_LIST: ImagePreset[] = Object.values(IMAGE_PRESETS);

export interface PresetPromptOptions {
  /** What the image should show, in plain descriptive language. */
  subject: string;
  /** Optional extra art direction appended after the preset layout. */
  extra?: string;
}

/** Build the full prompt for a preset. Order: format, brand, layout, subject, constraints. */
export function buildPresetPrompt(
  presetId: ImagePresetId,
  { subject, extra }: PresetPromptOptions,
): string {
  const preset = IMAGE_PRESETS[presetId];
  return [
    `Generate a ${preset.aspect} image (${preset.size.width}x${preset.size.height}px) for use as: ${preset.purpose}`,
    BRAND_STYLE,
    `Layout: ${preset.layout}`,
    `Subject: ${subject.trim()}`,
    extra?.trim() ? `Additional direction: ${extra.trim()}` : "",
    `Constraints: ${GLOBAL_CONSTRAINTS}${preset.constraints ? ` ${preset.constraints}` : ""}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export interface GenerateImageRequestBody {
  prompt: string;
  preset: ImagePresetId;
  stream?: boolean;
}

/** Ready-to-post body for /api/generate-image. */
export function buildImageRequest(
  presetId: ImagePresetId,
  options: PresetPromptOptions & { stream?: boolean },
): GenerateImageRequestBody {
  return {
    prompt: buildPresetPrompt(presetId, options),
    preset: presetId,
    stream: options.stream ?? true,
  };
}
