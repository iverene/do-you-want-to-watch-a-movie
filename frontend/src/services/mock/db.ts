// In-memory mock database, persisted to localStorage under serviceConfig.mockStorageKey.
import { serviceConfig } from '../config';
import type { Avatar, Genre, ImportStatus, MediaType, Stars, Title } from '../types';
import { buildSeed } from './seed';

export const DB_VERSION = 2; // 2: likes, no watchlist reactions, bigger catalog

export interface DbUser {
  id: string;
  username: string;
  displayName: string;
  avatar: Avatar;
  favoriteGenreIds: string[];
  theme: 'light' | 'dark';
  password: string;
  topFive: (string | null)[]; // screening ids, positions 1..5
}

export interface DbScreening {
  id: string;
  number: number;
  titleId: string;
  watchedOn: string | null;
  watchedYear: number;
  datePrecision: 'day' | 'year';
  season: number | null;
  viewerIds: string[];
  source: 'app' | 'import';
  addedBy: string;
  createdAt: string;
}

export interface DbRating {
  screeningId: string;
  userId: string;
  stars: Stars;
  comment: string | null;
  updatedAt: string;
}

export interface DbWatchlistItem {
  id: string;
  titleId: string;
  addedBy: string;
  addedAt: string;
}

export interface DbLike {
  userId: string;
  titleId: string;
  likedAt: string;
}

export interface DbNight {
  id: string;
  titleId: string;
  proposedBy: string;
  date: string;
  status: 'proposed' | 'accepted' | 'declined';
  createdAt: string;
}

export interface DbImportRow {
  id: string;
  rawTitle: string;
  watchedYear: number;
  matchTitleId: string | null;
  candidateIds: string[];
  status: ImportStatus;
  mediaType: MediaType | null;
  who: 'both' | string;
  stars: Record<string, Stars>;
}

export interface Db {
  version: number;
  users: DbUser[];
  genres: Genre[];
  titles: Title[];
  screenings: DbScreening[];
  ratings: DbRating[];
  watchlist: DbWatchlistItem[];
  likes: DbLike[];
  nights: DbNight[];
  importRows: DbImportRow[];
  note: { mood: string; statusNote: string; history: { text: string; at: string }[] };
  bestStreak: number;
  recRotation: number;
  loginFails: { count: number; until: string | null };
}

let current: Db | null = null;

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function load(): Db {
  const raw = storage()?.getItem(serviceConfig.mockStorageKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Db;
      if (parsed.version === DB_VERSION) return parsed;
    } catch {
      /* corrupt data: fall through to a fresh seed */
    }
  }
  return seed();
}

/** The live database. Loaded from localStorage (or seeded) on first use. */
export function db(): Db {
  if (!current) current = load();
  return current;
}

/** Persist after every write. */
export function save(): void {
  if (!current) return;
  try {
    storage()?.setItem(serviceConfig.mockStorageKey, JSON.stringify(current));
  } catch {
    /* quota exceeded or storage blocked: keep working in memory */
  }
}

/** Fresh sample data, saved immediately. */
export function seed(): Db {
  current = buildSeed(DB_VERSION);
  save();
  return current;
}

/** "Reset demo data" in Settings. */
export function resetDb(): void {
  seed();
}

/** Replace the database (tests). */
export function setDb(next: Db): void {
  current = next;
}

let counter = 0;
export function uid(prefix: string): string {
  counter += 1;
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${counter}`;
  return `${prefix}-${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
