import { createHash, randomBytes } from "node:crypto";

/** URL-safe opaque token (plaintext only returned once at creation). */
export function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
