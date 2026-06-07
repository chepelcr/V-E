/**
 * Client helpers that talk to the dev-only write-back middleware
 * (see `vite-plugin-local-cms.ts`). When running the local dev server, admin
 * edits are written straight into the repo's source files so they can be
 * committed. In any non-dev build these are no-ops (return false), and callers
 * fall back to a browser download.
 */

/** True when the local write-back endpoints are available (vite dev). */
export const LOCAL_CMS_ENABLED = import.meta.env.DEV;

/** Write a content/translation JSON file into the repo. Returns true on success. */
export async function saveContentFile(filename: string, data: unknown): Promise<boolean> {
  if (!LOCAL_CMS_ENABLED) return false;
  try {
    const res = await fetch("/__local/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface UploadResult {
  ok: boolean;
  /** Root-relative URL to reference the written asset, e.g. "/media/hero.png". */
  url?: string;
  error?: string;
}

/**
 * Write an image/video/audio asset (data URL) into the repo's `public/` folder.
 * Pass `dir: "media"` to write under `public/media/`. Returns the root-relative
 * URL of the written file (so callers can store it in content), or `{ ok:false }`
 * when the write-back endpoint isn't available (non-dev build).
 */
export async function uploadAsset(
  filename: string,
  dataUrl: string,
  dir?: "media",
): Promise<UploadResult> {
  if (!LOCAL_CMS_ENABLED) return { ok: false, error: "unavailable" };
  try {
    const res = await fetch("/__local/asset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, dataUrl, dir }),
    });
    const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
    return { ok: res.ok && !!json.ok, url: json.url, error: json.error };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export interface PublishResult {
  ok: boolean;
  /** Short commit hash when a commit was created. */
  hash?: string;
  branch?: string;
  message?: string;
  /** True when there was nothing staged to commit. */
  nothingToPublish?: boolean;
  /** Error text (git stderr) when ok is false. */
  error?: string;
}

/**
 * Stage the content/translations/public files, commit them with an auto
 * message, and push the current branch — the dev-only "Publish" action that
 * saves a trip to the terminal. Returns the parsed server result, or an error
 * object when the write-back endpoint isn't available (non-dev build).
 */
export async function publishChanges(): Promise<PublishResult> {
  if (!LOCAL_CMS_ENABLED) return { ok: false, error: "unavailable" };
  try {
    const res = await fetch("/__local/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    return (await res.json()) as PublishResult;
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  /** Committer date, ISO 8601. */
  date: string;
}

export interface GitLogResult {
  ok: boolean;
  branch?: string;
  /** Total commits reachable from HEAD (for pagination). */
  total?: number;
  skip?: number;
  limit?: number;
  commits?: GitCommit[];
  error?: string;
}

export interface GitStatusResult {
  ok: boolean;
  /** True when the content/translations/public dirs have uncommitted changes. */
  pending?: boolean;
  /** Number of changed files. */
  files?: number;
  error?: string;
}

/** Whether there are unpublished (uncommitted) changes in the content dirs. */
export async function fetchGitStatus(): Promise<GitStatusResult> {
  if (!LOCAL_CMS_ENABLED) return { ok: false, pending: false };
  try {
    const res = await fetch("/__local/git-status");
    return (await res.json()) as GitStatusResult;
  } catch (err) {
    return { ok: false, pending: false, error: String(err) };
  }
}

/** Read a page of recent commits on the current branch (admin Diagnostics). */
export async function fetchGitLog(skip = 0, limit = 10): Promise<GitLogResult> {
  if (!LOCAL_CMS_ENABLED) return { ok: false, error: "unavailable" };
  try {
    const res = await fetch(`/__local/git-log?skip=${skip}&limit=${limit}`);
    return (await res.json()) as GitLogResult;
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
