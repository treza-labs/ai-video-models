/**
 * Regenerates data/video-models.json, data/image-models.json and the tables
 * in README.md from Treza's model catalog.
 *
 *   TREZA_XYZ_DIR=../treza-xyz npm run generate            # write the files
 *   npm run generate -- --check                             # exit 1 if they would change
 *   npm run generate -- --check-links                       # also request every Treza page
 *
 * The catalog is read from a git ref of the treza-xyz checkout
 * (TREZA_XYZ_REF, default origin/main), never from its working tree: the
 * files at that ref are exported to a temporary folder with `git archive`,
 * scripts/read-catalog.ts runs there against them, and the folder is
 * deleted. Nothing in the checkout is changed. Fetch the ref first
 * (REFRESH.md does).
 *
 * `updated` in each data file moves only when that file's models change, so
 * a run that finds nothing new leaves every file byte for byte as it was.
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020').default;
const addFormats = require('ajv-formats').default;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const README = join(ROOT, 'README.md');
const RAW = 'https://raw.githubusercontent.com/treza-labs/ai-video-models/main';

const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');
const CHECK_LINKS = args.has('--check-links');

// ---------------------------------------------------------------- types

type Audio = 'optional' | 'always' | 'none' | 'unknown';

interface VideoModel {
  id: string;
  name: string;
  vendor: string;
  treza_page: string | null;
  lengths_seconds: number[];
  aspect_ratios: string[];
  resolutions: string[];
  default_resolution: string | null;
  max_resolution: string | null;
  audio: Audio;
  text_to_video: boolean;
  first_frame: boolean;
  last_frame: boolean;
  reference_images: boolean;
  price: {
    per_second: number;
    resolution: string | null;
    per_second_by_resolution: Record<string, number> | null;
    per_second_without_audio: number | null;
    minimum_billed_seconds: number | null;
    per_input_image: number | null;
    per_reference_image: number | null;
    clips: Record<string, number>;
  } | null;
  shuts_down_on: string | null;
}

interface ImageModel {
  id: string;
  name: string;
  vendor: string;
  treza_page: string | null;
  aspect_ratios: string[];
  aspect_ratio_auto: boolean;
  resolutions: string[];
  max_resolution: string | null;
  quality_options: string[];
  text_to_image: boolean;
  reference_images: boolean;
  max_reference_images: number | null;
  transparent_background: boolean;
  price: {
    per_image: number;
    by_resolution: Record<string, number> | null;
    by_quality: Record<string, number> | null;
    by_aspect_ratio: Record<string, number> | null;
    per_reference_image: number | null;
  } | null;
  shuts_down_on: string | null;
}

interface Catalog {
  video: VideoModel[];
  image: ImageModel[];
  skipped: Array<{ kind: string; model: string; reason: string }>;
}

// ---------------------------------------------------------------- read the catalog

function git(dir: string, gitArgs: string[], input?: Buffer): Buffer {
  return execFileSync('git', ['-C', dir, ...gitArgs], { input, maxBuffer: 1024 * 1024 * 1024 });
}

function readCatalog(): Catalog {
  const trezaDir = resolve(ROOT, process.env.TREZA_XYZ_DIR || '../treza-xyz');
  const ref = process.env.TREZA_XYZ_REF || 'origin/main';
  if (!existsSync(join(trezaDir, '.git'))) throw new Error(`No git checkout at ${trezaDir} (set TREZA_XYZ_DIR)`);
  if (!existsSync(join(trezaDir, 'node_modules'))) {
    throw new Error(`${trezaDir} has no node_modules: install its dependencies once before generating`);
  }
  const commit = git(trezaDir, ['log', '-1', '--format=%h %cI', ref]).toString().trim();
  console.error(`catalog: ${ref} at ${commit}`);

  const snapshot = mkdtempSync(join(tmpdir(), 'ai-video-models-'));
  try {
    const tar = git(trezaDir, ['archive', '--format=tar', ref, 'lib', 'tsconfig.json', 'package.json']);
    execFileSync('tar', ['-x', '-C', snapshot], { input: tar, maxBuffer: 1024 * 1024 * 1024 });
    symlinkSync(join(trezaDir, 'node_modules'), join(snapshot, 'node_modules'), 'dir');
    mkdirSync(join(snapshot, '__ai_video_models'));
    cpSync(join(ROOT, 'scripts', 'read-catalog.ts'), join(snapshot, '__ai_video_models', 'read-catalog.ts'));

    // A bare environment, so no local setting or override can move a price.
    const env = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '', TMPDIR: tmpdir() };
    const out = execFileSync(join(ROOT, 'node_modules', '.bin', 'tsx'), ['__ai_video_models/read-catalog.ts'], {
      cwd: snapshot,
      env,
      maxBuffer: 256 * 1024 * 1024,
    });
    return JSON.parse(out.toString()) as Catalog;
  } finally {
    rmSync(snapshot, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- shape the data files

const byVendorThenName = (a: { vendor: string; name: string }, b: { vendor: string; name: string }) =>
  a.vendor.localeCompare(b.vendor, 'en', { sensitivity: 'base' }) ||
  a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' });

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readJson(path: string): any | undefined {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
}

function dataFile<T>(kind: 'video' | 'image', models: T[], previous: any) {
  const unchanged = previous && isDeepStrictEqual(previous.models, models);
  return {
    kind,
    updated: unchanged ? previous.updated : today(),
    currency: 'USD',
    source: 'https://www.trezalabs.com/models',
    license: 'CC-BY-4.0',
    schema: `${RAW}/data/schema.json`,
    count: models.length,
    models,
  };
}

/** Two-space JSON, with lists of plain values (lengths, ratios, sizes) kept on one line. */
const json = (value: unknown) =>
  `${JSON.stringify(value, null, 2).replace(/\[\s+([^[\]{}]*?)\s+\]/g, (_, items: string) => `[${items.split(/,\s+/).join(', ')}]`)}\n`;

// ---------------------------------------------------------------- README tables

const usd = (n: number) => `$${n.toFixed(2)}`;
const rate = (n: number) => `$${n.toFixed(3)}`;
const cell = (s: string) => s.replace(/\|/g, '\\|');

function lengthsLabel(lengths: number[]): string {
  if (lengths.length === 1) return `${lengths[0]} s`;
  const first = lengths[0];
  const last = lengths[lengths.length - 1];
  const step = lengths[1] - first;
  const evenSteps = lengths.every((n, i) => n === first + i * step);
  if (evenSteps && lengths.length > 3) return step === 1 ? `${first} to ${last} s` : `${first} to ${last} s, every ${step}`;
  if (evenSteps && step === 1 && lengths.length === 3) return `${first} to ${last} s`;
  return `${lengths.slice(0, -1).join(', ')}, ${last} s`;
}

function aspectsLabel(ratios: string[], auto = false): string {
  if (ratios.length === 0) return auto ? 'auto' : '—';
  const extra = auto ? ', auto' : '';
  if (ratios.length <= 3) return `${ratios.join(', ')}${extra}`;
  return `${ratios[0]} to ${ratios[ratios.length - 1]} (${ratios.length})${extra}`;
}

const AUDIO_LABEL: Record<Audio, string> = {
  optional: 'Yes',
  always: 'Always on',
  none: 'No',
  unknown: 'Not listed',
};

function imageInputLabel(m: VideoModel): string {
  const parts: string[] = [];
  if (m.first_frame && m.last_frame) parts.push('First + last frame');
  else if (m.first_frame) parts.push('First frame');
  if (m.reference_images) parts.push('references');
  if (parts.length === 0) return 'No';
  const label = parts.join(', ');
  const sentence = label.charAt(0).toUpperCase() + label.slice(1);
  return m.text_to_video ? sentence : `Required: ${sentence.toLowerCase()}`;
}

/** The length a model renders for one that was asked for: the nearest it makes, a tie rounding up. */
function nearestLength(lengths: number[], asked: number): number {
  let best = lengths[0];
  for (const n of lengths) {
    const gap = Math.abs(n - asked);
    const bestGap = Math.abs(best - asked);
    if (gap < bestGap || (gap === bestGap && n > best)) best = n;
  }
  return best;
}

function clipLabel(m: VideoModel, asked: number): string {
  if (!m.price) return 'Quoted per run';
  const seconds = nearestLength(m.lengths_seconds, asked);
  const price = usd(m.price.clips[String(seconds)]);
  return seconds === asked ? price : `${price} (${seconds} s)`;
}

function perSecondLabel(m: VideoModel): string {
  if (!m.price) return '—';
  const min = m.price.minimum_billed_seconds;
  return min ? `${rate(m.price.per_second)}, ${min} s min` : rate(m.price.per_second);
}

/** The resolution the prices are for, then the highest the model offers. */
function resolutionLabel(m: VideoModel): string {
  const priced = m.price?.resolution ?? m.default_resolution;
  if (!m.max_resolution) return priced ?? '—';
  if (!priced || priced === m.max_resolution) return priced ? priced : `max ${m.max_resolution}`;
  return `${priced}, max ${m.max_resolution}`;
}

const linkLabel = (url: string | null) => (url ? `[Try](${url})` : '—');

function videoTable(models: VideoModel[]): string {
  const rows = models.map((m) =>
    [
      m.name,
      m.vendor,
      lengthsLabel(m.lengths_seconds),
      aspectsLabel(m.aspect_ratios),
      resolutionLabel(m),
      AUDIO_LABEL[m.audio],
      imageInputLabel(m),
      clipLabel(m, 5),
      clipLabel(m, 10),
      perSecondLabel(m),
      linkLabel(m.treza_page),
    ]
      .map(cell)
      .join(' | ')
  );
  return [
    '| Model | Vendor | Lengths | Aspect ratios | Resolution | Audio | Image input | 5 s | 10 s | Per second | Link |',
    '| --- | --- | --- | --- | --- | --- | --- | --: | --: | --: | --- |',
    ...rows.map((r) => `| ${r} |`),
  ].join('\n');
}

function imagePriceRange(m: ImageModel): string {
  if (!m.price) return '—';
  const all = [
    m.price.per_image,
    ...Object.values(m.price.by_resolution ?? {}),
    ...Object.values(m.price.by_quality ?? {}),
    ...Object.values(m.price.by_aspect_ratio ?? {}),
  ];
  const low = Math.min(...all);
  const high = Math.max(...all);
  return low === high ? '—' : `${usd(low)} to ${usd(high)}`;
}

function referencesLabel(m: ImageModel): string {
  if (!m.reference_images) return 'No';
  const count = m.max_reference_images ? `up to ${m.max_reference_images}` : 'yes';
  return m.text_to_image ? count.charAt(0).toUpperCase() + count.slice(1) : `Required, ${count}`;
}

function imageTable(models: ImageModel[]): string {
  const rows = models.map((m) =>
    [
      m.name,
      m.vendor,
      aspectsLabel(m.aspect_ratios, m.aspect_ratio_auto),
      m.max_resolution ?? '—',
      referencesLabel(m),
      m.price ? usd(m.price.per_image) : 'Quoted per run',
      imagePriceRange(m),
      linkLabel(m.treza_page),
    ]
      .map(cell)
      .join(' | ')
  );
  return [
    '| Model | Vendor | Aspect ratios | Max size | Reference images | Per image | Range by setting | Link |',
    '| --- | --- | --- | --- | --- | --: | --: | --- |',
    ...rows.map((r) => `| ${r} |`),
  ].join('\n');
}

function replaceBetween(text: string, marker: string, body: string): string {
  const start = `<!-- ${marker}:start -->`;
  const end = `<!-- ${marker}:end -->`;
  const from = text.indexOf(start);
  const to = text.indexOf(end);
  if (from < 0 || to < from) throw new Error(`README.md is missing the ${start} ... ${end} markers`);
  return `${text.slice(0, from + start.length)}\n${body}\n${text.slice(to)}`;
}

function renderReadme(text: string, video: ReturnType<typeof dataFile<VideoModel>>, image: ReturnType<typeof dataFile<ImageModel>>) {
  const updated = [video.updated, image.updated].sort().at(-1);
  let out = replaceBetween(
    text,
    'updated',
    `Updated ${updated}: ${video.count} video models and ${image.count} image models.`
  );
  out = replaceBetween(out, 'video-models', videoTable(video.models));
  out = replaceBetween(out, 'image-models', imageTable(image.models));
  return out;
}

// ---------------------------------------------------------------- checks

function validate(name: string, value: unknown) {
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  addFormats(ajv);
  const check = ajv.compile(readJson(join(DATA, 'schema.json')));
  if (!check(value)) {
    throw new Error(`${name} does not match data/schema.json:\n${ajv.errorsText(check.errors, { separator: '\n' })}`);
  }
}

async function checkLinks(urls: string[]) {
  const failed: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
      if (res.status !== 200) failed.push(`${res.status} ${url}`);
    } catch (err) {
      failed.push(`error ${url}: ${(err as Error).message}`);
    }
  }
  console.error(failed.length ? `links failing:\n  ${failed.join('\n  ')}` : `links: all ${urls.length} answer 200`);
  return failed.length === 0;
}

// ---------------------------------------------------------------- main

async function main() {
  const catalog = readCatalog();
  for (const s of catalog.skipped) console.error(`left out (${s.kind}) ${s.model}: ${s.reason}`);

  const video = dataFile('video', [...catalog.video].sort(byVendorThenName), readJson(join(DATA, 'video-models.json')));
  const image = dataFile('image', [...catalog.image].sort(byVendorThenName), readJson(join(DATA, 'image-models.json')));
  validate('video-models.json', video);
  validate('image-models.json', image);

  const files: Record<string, string> = {
    [join(DATA, 'video-models.json')]: json(video),
    [join(DATA, 'image-models.json')]: json(image),
    [README]: renderReadme(readFileSync(README, 'utf8'), video, image),
  };
  const changed = Object.entries(files).filter(([path, body]) => !existsSync(path) || readFileSync(path, 'utf8') !== body);

  let ok = true;
  if (CHECK_LINKS) {
    const urls = [...video.models, ...image.models].map((m) => m.treza_page).filter((u): u is string => !!u);
    ok = (await checkLinks([...new Set(urls)])) && ok;
  }

  if (CHECK) {
    console.error(changed.length ? `would change: ${changed.map(([p]) => p.slice(ROOT.length + 1)).join(', ')}` : 'up to date');
    process.exit(changed.length || !ok ? 1 : 0);
  }
  for (const [path, body] of changed) writeFileSync(path, body);
  console.error(
    `${video.count} video models, ${image.count} image models; ` +
      (changed.length ? `wrote ${changed.map(([p]) => p.slice(ROOT.length + 1)).join(', ')}` : 'nothing changed')
  );
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
