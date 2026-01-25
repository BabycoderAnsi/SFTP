import path from "path";

const BASE_DIR = "/upload";

export function resolveSafePath(userPath: string = "/"): string {
  const resolved = path.posix.normalize(path.posix.join(BASE_DIR, userPath));

  if (!resolved.startsWith(BASE_DIR)) {
    throw new Error("Invalid path");
  }

  if (resolved.includes("..")) {
    throw new Error("Invalid path");
  }

  return resolved;
}
