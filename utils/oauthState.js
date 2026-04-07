import crypto from "crypto";

function getStateSecret() {
  const secret = process.env.SPOTIFY_STATE_SECRET || process.env.SPOTIFY_CLIENT_SECRET;

  if (!secret) {
    throw new Error("SPOTIFY_STATE_SECRET or SPOTIFY_CLIENT_SECRET is required for OAuth state signing");
  }

  return secret;
}

function signPayload(payload) {
  return crypto
    .createHmac("sha256", getStateSecret())
    .update(payload)
    .digest("base64url");
}

export function createSignedState() {
  const nonce = crypto.randomUUID();
  const issuedAt = Date.now();
  const payload = `${nonce}.${issuedAt}`;
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function validateSignedState(state, maxAgeMs = 10 * 60 * 1000) {
  if (!state || typeof state !== "string") return false;

  const parts = state.split(".");
  if (parts.length !== 3) return false;

  const [nonce, issuedAt, providedSignature] = parts;
  if (!nonce || !issuedAt || !providedSignature) return false;

  const issuedAtNumber = Number(issuedAt);
  if (!Number.isFinite(issuedAtNumber)) return false;

  const payload = `${nonce}.${issuedAt}`;
  const expectedSignature = signPayload(payload);

  let validSignature = false;
  try {
    validSignature = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature),
    );
  } catch {
    return false;
  }

  if (!validSignature) return false;

  const ageMs = Date.now() - issuedAtNumber;
  return ageMs >= 0 && ageMs <= maxAgeMs;
}
