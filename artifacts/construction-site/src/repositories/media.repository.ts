import mediaData from "../content/media.json";
import type { MediaLibrary } from "../lib/media";

/** The media library registry (`media.json`). */
export function getMedia(): MediaLibrary {
  return mediaData as MediaLibrary;
}
