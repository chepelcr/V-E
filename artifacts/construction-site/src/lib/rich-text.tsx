import { Fragment, type ReactNode } from "react";

/**
 * Lightweight rich-text for editable content. Editors type a simple syntax in
 * the JSON/admin and it renders to styled React nodes — no HTML, no XSS surface
 * (we never use `dangerouslySetInnerHTML`; everything is React text/spans).
 *
 * Syntax (markers nest, so styles combine):
 *   \n            → line break (type a literal backslash-n)
 *   {{text}}      → primary/brand highlight
 *   [[text]]      → muted-foreground
 *   ((text))      → foreground (strong contrast)
 *   **text**      → bold
 *   [[**text**]]  → muted AND bold (any combination nests)
 *
 * Plain text with none of the above renders unchanged, so it's safe to apply
 * everywhere. Highlight styles use semantic theme tokens (not hardcoded hex) so
 * a palette swap stays consistent.
 */

type Style = "primary" | "muted" | "strong" | "bold";

const STYLE_CLASS: Record<Style, string> = {
  primary: "text-primary",
  muted: "text-muted-foreground",
  strong: "text-foreground",
  bold: "font-bold",
};

// Non-global regexes: each `.exec` returns the first match from the start, so
// we can scan recursively without lastIndex bookkeeping.
const PATTERNS: Array<{ regex: RegExp; style: Style }> = [
  { regex: /\{\{([\s\S]+?)\}\}/, style: "primary" },
  { regex: /\[\[([\s\S]+?)\]\]/, style: "muted" },
  { regex: /\(\(([\s\S]+?)\)\)/, style: "strong" },
  { regex: /\*\*([\s\S]+?)\*\*/, style: "bold" },
];

/**
 * Recursively tokenise a line: find the earliest-starting marker, emit the text
 * before it, then a styled <span> whose children are the *parsed* inner text
 * (so markers nest and styles combine), then continue after the marker.
 */
function renderLine(line: string, keyPrefix: string): ReactNode[] {
  let best: { index: number; length: number; text: string; style: Style } | null = null;
  for (const { regex, style } of PATTERNS) {
    const m = regex.exec(line);
    if (m && m.index !== undefined && (best === null || m.index < best.index)) {
      best = { index: m.index, length: m[0].length, text: m[1], style };
    }
  }

  if (!best) return line ? [line] : [];

  const out: ReactNode[] = [];
  if (best.index > 0) out.push(line.slice(0, best.index));
  out.push(
    <span key={keyPrefix} className={STYLE_CLASS[best.style]}>
      {renderLine(best.text, `${keyPrefix}i`)}
    </span>,
  );
  const rest = line.slice(best.index + best.length);
  if (rest) out.push(...renderLine(rest, `${keyPrefix}r`));
  return out;
}

/** Parse the rich-text syntax into React nodes. */
export function parseRichText(value: string): ReactNode {
  if (!value) return value;
  const lines = value.split("\\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {renderLine(line, String(i))}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

/** Convenience renderer. */
export function RichText({ children }: { children: string }) {
  return <>{parseRichText(children)}</>;
}

/** One-line reminder shown under admin fields that support the syntax. */
export const RICH_TEXT_HINT =
  "Formato: \\n salto de línea · {{resaltado}} · [[atenuado]] · ((destacado)) · **negrita** · se combinan: [[**atenuado y negrita**]]";
