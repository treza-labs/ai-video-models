/**
 * What the regenerated data files change against the last commit, as a
 * commit message: a subject line, a blank line, then one line per change.
 * Prints nothing when the models are the same.
 *
 *   npm run -s changes
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

type Model = { id: string; name: string; price: Record<string, any> | null; [key: string]: unknown };

function committed(path: string): Model[] {
  try {
    return JSON.parse(execFileSync('git', ['-C', ROOT, 'show', `HEAD:${path}`], { stdio: ['ignore', 'pipe', 'ignore'] }).toString()).models;
  } catch {
    return [];
  }
}

const current = (path: string): Model[] => JSON.parse(readFileSync(join(ROOT, path), 'utf8')).models;
const usd = (n: number | undefined) => (n === undefined ? 'none' : `$${n.toFixed(2)}`);

/** The headline price a reader compares: a 5 second clip (or the nearest length), or one image. */
function headline(m: Model): { label: string; usd?: number } {
  if (!m.price) return { label: 'price' };
  if (typeof m.price.per_image === 'number') return { label: 'per image', usd: m.price.per_image };
  const lengths = Object.keys(m.price.clips ?? {}).map(Number);
  const seconds = lengths.includes(5) ? 5 : lengths[0];
  return { label: `${seconds} s`, usd: m.price.clips?.[String(seconds)] };
}

function describe(kind: string, before: Model[], after: Model[]): string[] {
  const lines: string[] = [];
  const old = new Map(before.map((m) => [m.id, m]));
  const now = new Map(after.map((m) => [m.id, m]));
  for (const m of after) if (!old.has(m.id)) lines.push(`Added ${kind} model ${m.name}`);
  for (const m of before) if (!now.has(m.id)) lines.push(`Removed ${kind} model ${m.name}`);
  for (const m of after) {
    const was = old.get(m.id);
    if (!was || isDeepStrictEqual(was, m)) continue;
    if (!isDeepStrictEqual(was.price, m.price)) {
      const a = headline(was);
      const b = headline(m);
      lines.push(
        a.label === b.label && a.usd !== b.usd
          ? `${m.name}: ${b.label} ${usd(a.usd)} to ${usd(b.usd)}`
          : `${m.name}: prices changed`
      );
    }
    const fields = Object.keys(m).filter((k) => k !== 'price' && !isDeepStrictEqual(was[k], m[k]));
    if (fields.length) lines.push(`${m.name}: ${fields.join(', ')} changed`);
  }
  return lines;
}

const lines = [
  ...describe('video', committed('data/video-models.json'), current('data/video-models.json')),
  ...describe('image', committed('data/image-models.json'), current('data/image-models.json')),
];

if (lines.length) {
  const subject = lines.length === 1 ? lines[0] : `Refresh: ${lines.length} model changes`;
  process.stdout.write(`${subject}\n\n${lines.join('\n')}\n`);
}
