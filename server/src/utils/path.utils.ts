import path from "path";
import { log } from '../logging/logging';

const BASE_DIR = "/upload";

export function resolveSafePath(userPath: string = "/"): string {
  const resolved = path.posix.normalize(path.posix.join(BASE_DIR, userPath));

  if (!resolved.startsWith(BASE_DIR)) {
    log("warn", "path_traversal_blocked", {
      userPath,
      resolved,
      reason: "path_outside_base_dir",
    });
    throw new Error("Invalid path");
  }

  if (resolved.includes("..")) {
    log("warn", "path_traversal_blocked", {
      userPath,
      resolved,
      reason: "traversal_sequence_detected",
    });
    throw new Error("Invalid path");
  }

  return resolved;
}
