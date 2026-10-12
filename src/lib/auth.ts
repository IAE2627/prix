import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'admin_session';
export const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function adminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return password && password.length > 0 ? password : null;
}

export function isAdminConfigured(): boolean {
  return adminPassword() !== null;
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Comparaison en temps constant ; refuse tout accès si ADMIN_PASSWORD n'est pas défini. */
export function checkPassword(candidate: string): boolean {
  const password = adminPassword();
  if (!password) return false;
  return timingSafeEqual(sha256(candidate), sha256(password));
}

function sign(payload: string, password: string): string {
  // La clé dérive du mot de passe : le changer invalide toutes les sessions ouvertes.
  const key = sha256(`admin-session:${password}`);
  return createHmac('sha256', key).update(payload).digest('hex');
}

export function createSessionToken(): string {
  const password = adminPassword();
  if (!password) throw new Error('ADMIN_PASSWORD non défini');
  const expiresAt = String(Date.now() + SESSION_DURATION_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt, password)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const password = adminPassword();
  if (!password || !token) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Date.now()) return false;
  const expected = Buffer.from(sign(expiresAt, password));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

// Limitation simple des tentatives de connexion (en mémoire, par adresse IP).
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function registerLoginAttempt(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}

export function clearLoginAttempts(ip: string): void {
  attempts.delete(ip);
}
