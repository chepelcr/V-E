import notFoundData from "../content/notFound.json";

/**
 * Not-Found (404) page content (singleton). The 404 label/code, the bilingual
 * title + message, the "back home" link label, and the icon-registry token for
 * the glyph. Every copy field is localized `{es,en}`; `iconName` is an
 * icon-registry token resolved through `resolveIcon`.
 */
export type NotFoundContent = typeof notFoundData;

export function getNotFound(): NotFoundContent {
  return notFoundData;
}
