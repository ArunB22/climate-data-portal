import { DatasetPayload } from '../models/dataset.model';

/** CSV headers are stored as originally uploaded, so lookups by expected name must be case-insensitive. */
export function findColumn(payload: DatasetPayload, ...candidates: string[]): string | null {
  const lowerCandidates = candidates.map((c) => c.toLowerCase());
  return payload.columns.find((column) => lowerCandidates.includes(column.toLowerCase())) ?? null;
}

export function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}
