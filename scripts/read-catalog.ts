/**
 * Reads Treza's video and image model catalog out of a snapshot of Treza's
 * app code and prints the public fields as JSON on stdout.
 *
 * scripts/generate.ts copies this file into that snapshot and runs it there,
 * so the `@/lib/...` imports resolve against the snapshot, not this repo. It
 * cannot run on its own.
 *
 * Only what a customer can already see leaves this file: the specs the model
 * pickers and the /models pages show, and the price Treza quotes before a
 * run. Anything else it reads (catalog ids, descriptions) is used to decide
 * and never printed, except in `skipped`, which generate.ts logs locally and
 * does not write to the data files.
 */

import * as videoCatalog from '@/lib/nodes/video-models';
import * as imageCatalog from '@/lib/nodes/image-models';
import { MODEL_PAGES, type ModelPageContent } from '@/lib/model-pages';
import { MODEL_NAMES } from '@/lib/credit-choice';
import { estimatedNodeCostUsd, videoRatePerSecond } from '@/lib/credits';
import { KNOWN_IMAGE_MODEL_RATES } from '@/lib/image-credit-rates';
import { creditsUsd } from '@/lib/chat/inspiration';
import { modelRetirement } from '@/lib/model-retirements';

const SITE = 'https://www.trezalabs.com';
/** Any reachable-looking image URL: the estimates only count images, they never fetch them. */
const SAMPLE_IMAGE = 'https://example.com/reference.png';

type VideoSummary = videoCatalog.VideoModelSummary;
type ImageSummary = imageCatalog.ImageModelSummary;

const skipped: Array<{ kind: 'video' | 'image'; model: string; reason: string }> = [];

// ---------------------------------------------------------------- prices

/**
 * What Treza charges for an estimate, as its quotes show it. creditsUsd
 * rounds to the cent the way the checkout and the credit gate do; scaling
 * first keeps three places for a per-second or per-image rate.
 */
function charge(estimateUsd: number, places = 2): number {
  const scale = 10 ** (places - 2);
  return Number((creditsUsd(estimateUsd * scale) / scale).toFixed(places));
}

// ---------------------------------------------------------------- names and vendors

/** Vendors that the pages and the catalog spell two ways. */
const VENDOR_SPELLINGS: Record<string, string> = {
  'ByteDance Seed': 'ByteDance',
  'Microsoft AI': 'Microsoft',
};

const vendorName = (raw: string) => VENDOR_SPELLINGS[raw.trim()] ?? raw.trim();

/** The catalog's "Vendor: Model" prefix, when it has one. */
function catalogVendor(name: string): string | undefined {
  const match = /^([^:]+):\s*/.exec(name);
  return match ? match[1].trim() : undefined;
}

/**
 * The model's name as the catalog lists it, without the "Vendor: " prefix
 * and without a bare one-word tag in brackets at the end, which labels the
 * listing rather than the model. Brackets that name the model, as in
 * "Nano Banana Pro (Gemini 3 Pro Image)", stay.
 */
function catalogModelName(name: string): string {
  return name.replace(/^[^:]+:\s*/, '').replace(/\s*\(\S+\)\s*$/, '').trim();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const pages = MODEL_PAGES.filter((p) => p.category === 'video' || p.category === 'image');
const pageFor = (kind: 'video' | 'image', id: string): ModelPageContent | undefined =>
  pages.find((p) => p.category === kind && p.modelId === id);

/** First segment of a model id, mapped to the vendor its pages name, where every page agrees. */
const vendorByIdPrefix = (() => {
  const seen = new Map<string, Set<string>>();
  for (const page of pages) {
    const prefix = page.modelId.split('/')[0];
    if (!seen.has(prefix)) seen.set(prefix, new Set());
    seen.get(prefix)!.add(vendorName(page.provider));
  }
  const map = new Map<string, string>();
  for (const [prefix, vendors] of seen) if (vendors.size === 1) map.set(prefix, [...vendors][0]);
  return map;
})();

function vendorFor(kind: 'video' | 'image', id: string, catalogName: string, knownVendors: Set<string>): string | undefined {
  const page = pageFor(kind, id);
  if (page) return vendorName(page.provider);
  const byPrefix = vendorByIdPrefix.get(id.split('/')[0]);
  if (byPrefix) return byPrefix;
  const prefixed = catalogVendor(catalogName);
  if (prefixed) return vendorName(prefixed);
  const leading = [...knownVendors].find((v) => catalogName.startsWith(`${v} `));
  return leading ? vendorName(leading) : undefined;
}

/** Every vendor word a listing might start with, so "MiniMax H3 Max" and "MiniMax: H3 Max" read alike. */
function vendorWords(names: string[]): Set<string> {
  const words = new Set<string>();
  for (const page of pages) words.add(page.provider.trim());
  for (const name of names) {
    const prefixed = catalogVendor(name);
    if (prefixed) words.add(prefixed);
  }
  return words;
}

function withoutLeadingVendor(name: string, words: Set<string>): string {
  const word = [...words].sort((a, b) => b.length - a.length).find((w) => name.startsWith(`${w} `));
  return word ? name.slice(word.length + 1) : name;
}

/** Every list of model entries a catalog module exports, merged by id, first listing wins. */
function exportedModels<T extends { id: string }>(mod: object, isEntry: (value: unknown) => value is T): T[] {
  const byId = new Map<string, T>();
  for (const value of Object.values(mod)) {
    if (!Array.isArray(value)) continue;
    for (const entry of value) if (isEntry(entry) && !byId.has(entry.id)) byId.set(entry.id, entry);
  }
  return [...byId.values()];
}

// ---------------------------------------------------------------- resolutions and shapes

/** One spelling per tier: lowercase "p", uppercase "K", and 2160p written as 4K. */
function resolutionLabel(raw: string): string {
  const value = raw.trim();
  if (/^\d+p$/i.test(value)) return value.toLowerCase() === '2160p' ? '4K' : value.toLowerCase();
  if (/^\d+(\.\d+)?k$/i.test(value)) return value.toUpperCase();
  return value;
}

/** Vertical pixels for a video tier, for ordering and the "max" column. */
function videoTierRank(label: string): number {
  const p = /^(\d+)p$/.exec(label);
  if (p) return Number(p[1]);
  if (label === '2K') return 1440;
  if (label === '4K') return 2160;
  return 0;
}

/** Long side for an image size setting: "768", "1K", "1.5K", "2K", "4K". */
function imageSizeRank(label: string): number {
  const k = /^(\d+(?:\.\d+)?)K$/i.exec(label);
  if (k) return Number(k[1]) * 1024;
  const n = Number(label);
  return Number.isFinite(n) ? n : 0;
}

function sortedUnique<T>(values: T[], rank: (v: T) => number): T[] {
  return [...new Set(values)].sort((a, b) => rank(a) - rank(b));
}

/** Widest first: 21:9 before 16:9 before 1:1 before 9:16. */
function aspectRank(ratio: string): number {
  const [w, h] = ratio.split(':').map(Number);
  return w > 0 && h > 0 ? -(w / h) : 0;
}

const isRatio = (value: string) => /^\d+(\.\d+)?:\d+(\.\d+)?$/.test(value);

// ---------------------------------------------------------------- video

const AUDIO_NONE_TEXT = /\bno audio\b|\bsilent\b/i;
const AUDIO_TEXT = /\bnative (?:stereo )?audio\b|\bsound with the picture\b|\bsound (?:is )?generated\b|\bwith sound\b/i;

type Audio = 'optional' | 'always' | 'none' | 'unknown';

function videoAudio(summary: VideoSummary, page: ModelPageContent | undefined): Audio {
  if (summary.generateAudio === true) {
    return summary.audioAlwaysOn || videoCatalog.videoModelAudioAlwaysOn(summary.id) ? 'always' : 'optional';
  }
  if (summary.audioAlwaysOn) return 'always';
  if (summary.generateAudio === false) return 'none';
  // No switch to send: whatever the model makes, it makes every time.
  const text = [...(page?.extraSpecs ?? []), page?.title ?? '', page?.subtitle ?? '', summary.description ?? ''].join('\n');
  if (AUDIO_NONE_TEXT.test(text)) return 'none';
  if (AUDIO_TEXT.test(text)) return 'always';
  return 'unknown';
}

function videoPrice(
  summary: VideoSummary,
  lengths: number[],
  audio: Audio,
  firstFrame: boolean,
  references: boolean,
  defaultResolution: string | null
) {
  const id = summary.id;
  const rate = videoRatePerSecond(id, {});
  if (rate === undefined || rate <= 0) return null;
  const estimate = (config: Record<string, unknown>) =>
    estimatedNodeCostUsd({ type: 'video-gen', config: { model: id, ...config } });

  const clips: Record<string, number> = {};
  for (const seconds of lengths) clips[String(seconds)] = charge(estimate({ duration: seconds }));

  const byResolution: Record<string, number> = {};
  for (const raw of sortedUnique(summary.supportedResolutions ?? [], (r) => videoTierRank(resolutionLabel(r)))) {
    const tier = videoRatePerSecond(id, { resolution: raw });
    if (tier !== undefined) byResolution[resolutionLabel(raw)] = charge(tier, 3);
  }

  const silent = audio === 'optional' ? videoRatePerSecond(id, { generateAudio: false }) : undefined;
  const shortest = lengths[0];
  const billed = shortest ? estimate({ duration: shortest }) / rate : 0;
  const base = shortest ? estimate({ duration: shortest }) : 0;
  const withFrame = firstFrame ? estimate({ duration: shortest, firstFrameImage: SAMPLE_IMAGE }) - base : 0;
  const withReference = references ? estimate({ duration: shortest, referenceImages: [SAMPLE_IMAGE] }) - base : 0;

  // The tier a node that picks no resolution is priced at: the model's
  // default where it is known, else the tier whose rate it is charged.
  const perSecond = charge(rate, 3);
  const matching = Object.entries(byResolution).filter(([, usd]) => usd === perSecond).map(([tier]) => tier);
  const pricedAt = defaultResolution ?? matching.at(-1) ?? null;

  return {
    per_second: perSecond,
    resolution: pricedAt,
    per_second_by_resolution: Object.keys(byResolution).length ? byResolution : null,
    per_second_without_audio: silent !== undefined && silent < rate ? charge(silent, 3) : null,
    minimum_billed_seconds: shortest && billed > shortest + 1e-9 ? Math.round(billed) : null,
    per_input_image: withFrame > 1e-9 ? charge(withFrame, 3) : null,
    per_reference_image: withReference > 1e-9 ? charge(withReference, 3) : null,
    clips,
  };
}

function readVideoModels() {
  const isSummary = (v: unknown): v is VideoSummary =>
    !!v &&
    typeof (v as VideoSummary).id === 'string' &&
    typeof (v as VideoSummary).name === 'string' &&
    Array.isArray((v as VideoSummary).supportedDurations);
  const listed = exportedModels(videoCatalog, isSummary);
  const words = vendorWords(listed.map((m) => m.name));

  const offered = listed.filter((m) => {
    if (!videoCatalog.isRoutableVideoModel(m.id, 'pipeline')) {
      skipped.push({ kind: 'video', model: m.id, reason: 'not offered on the Video Generation node' });
      return false;
    }
    if (videoCatalog.isRetiredVideoModel(m.id)) {
      skipped.push({ kind: 'video', model: m.id, reason: 'retired' });
      return false;
    }
    return true;
  });

  // The same model listed twice under one vendor and name: keep the one with a page.
  const byKey = new Map<string, VideoSummary>();
  const records = [];
  const ordered = [...offered].sort((a, b) => Number(!!pageFor('video', b.id)) - Number(!!pageFor('video', a.id)));
  for (const listing of ordered) {
    const summary = videoCatalog.resolveVideoModelSummary(listed, listing.id) ?? listing;
    const vendor = vendorFor('video', summary.id, summary.name, words);
    if (!vendor) {
      skipped.push({ kind: 'video', model: summary.id, reason: 'no vendor on its page or in the catalog' });
      continue;
    }
    const key = `${vendor}|${withoutLeadingVendor(catalogModelName(summary.name), words).toLowerCase()}`;
    const twin = byKey.get(key);
    if (twin) {
      skipped.push({ kind: 'video', model: summary.id, reason: `same model as ${twin.id}` });
      continue;
    }
    byKey.set(key, summary);

    const page = pageFor('video', summary.id);
    const name = page?.name ?? MODEL_NAMES[summary.id] ?? catalogModelName(summary.name);
    const lengths = sortedUnique(
      (summary.supportedDurations ?? []).filter((n) => Number.isInteger(n) && n > 0),
      (n) => n
    );
    if (lengths.length === 0) {
      skipped.push({ kind: 'video', model: summary.id, reason: 'no clip lengths listed' });
      continue;
    }
    const resolutions = sortedUnique((summary.supportedResolutions ?? []).map(resolutionLabel), videoTierRank);
    const measured = videoCatalog.defaultVideoResolutionFor(summary.id);
    const defaultResolution = measured ? resolutionLabel(measured) : null;
    const tiers = sortedUnique([...resolutions, ...(defaultResolution ? [defaultResolution] : [])], videoTierRank);
    const frames = summary.supportedFrameImages ?? [];
    const firstFrame = frames.includes('first_frame');
    const lastFrame = frames.includes('last_frame') && !videoCatalog.videoModelDropsLastFrame(summary.id);
    const references = videoCatalog.modelSupportsInputReferences(summary, summary.id);
    const audio = videoAudio(summary, page);
    const price = videoPrice(summary, lengths, audio, firstFrame, references, defaultResolution);
    if (!price) skipped.push({ kind: 'video', model: summary.id, reason: 'no verified price, listed without one' });

    records.push({
      id: page?.slug ?? slugify(name),
      name,
      vendor,
      treza_page: page ? `${SITE}/models/${page.slug}` : null,
      lengths_seconds: lengths,
      aspect_ratios: sortedUnique((summary.supportedAspectRatios ?? []).filter(isRatio), aspectRank),
      resolutions,
      default_resolution: defaultResolution,
      max_resolution: tiers.length ? tiers[tiers.length - 1] : null,
      audio,
      text_to_video: !videoCatalog.videoModelNeedsFirstFrame(summary.id),
      first_frame: firstFrame,
      last_frame: lastFrame,
      reference_images: references,
      price,
      shuts_down_on: modelRetirement(summary.id)?.on ?? null,
    });
  }

  for (const page of pages.filter((p) => p.category === 'video')) {
    if (!offered.some((m) => m.id === page.modelId)) {
      skipped.push({ kind: 'video', model: page.modelId, reason: `page /models/${page.slug} is not a Video Generation model` });
    }
  }
  return records;
}

// ---------------------------------------------------------------- image

function imagePrice(summary: ImageSummary, resolutions: string[], qualities: string[], aspects: string[]) {
  const id = summary.id;
  if (!KNOWN_IMAGE_MODEL_RATES[id]) return null;
  const estimate = (config: Record<string, unknown>) =>
    estimatedNodeCostUsd({ type: 'image-gen', config: { model: id, ...config } });
  const base = estimate({});
  const perImage = charge(base);

  const priced = (key: string, values: string[]) => {
    const out: Record<string, number> = {};
    for (const value of values) out[value] = charge(estimate({ [key]: value }));
    const differs = Object.values(out).some((usd) => usd !== perImage);
    return differs ? out : null;
  };
  const withReference = estimate({ referenceImages: [SAMPLE_IMAGE] }) - base;

  return {
    per_image: perImage,
    by_resolution: priced('resolution', resolutions),
    by_quality: priced('quality', qualities),
    by_aspect_ratio: priced('aspectRatio', aspects),
    per_reference_image: withReference > 1e-9 ? charge(withReference, 3) : null,
  };
}

function readImageModels() {
  const isSummary = (v: unknown): v is ImageSummary =>
    !!v &&
    typeof (v as ImageSummary).id === 'string' &&
    typeof (v as ImageSummary).name === 'string' &&
    Array.isArray((v as ImageSummary).outputModalities);
  const listed = exportedModels(imageCatalog, isSummary);
  const words = vendorWords(listed.map((m) => m.name));

  const byKey = new Map<string, ImageSummary>();
  const records = [];
  const ordered = [...listed].sort((a, b) => Number(!!pageFor('image', b.id)) - Number(!!pageFor('image', a.id)));
  for (const summary of ordered) {
    const refused = imageCatalog.unsupportedImageGenModelReason(summary.id);
    if (refused) {
      skipped.push({ kind: 'image', model: summary.id, reason: 'not offered on the Image Generation node' });
      continue;
    }
    if (!summary.outputModalities?.includes('image')) {
      skipped.push({ kind: 'image', model: summary.id, reason: 'does not output an image' });
      continue;
    }
    const vendor = vendorFor('image', summary.id, summary.name, words);
    if (!vendor) {
      skipped.push({ kind: 'image', model: summary.id, reason: 'no vendor on its page or in the catalog' });
      continue;
    }
    // The catalog's name, which says which variant it is ("Seedream 5.0 Pro",
    // where the page says "Seedream 5.0"), in the page's spelling when the two
    // differ only in punctuation ("FLUX.3 Image" for "FLUX 3 Image").
    const listedName = catalogModelName(summary.name);
    const page = pageFor('image', summary.id);
    const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = page && alnum(page.name) === alnum(listedName) ? page.name : listedName;
    const key = `${vendor}|${withoutLeadingVendor(listedName, words).toLowerCase()}`;
    const twin = byKey.get(key);
    if (twin) {
      skipped.push({ kind: 'image', model: summary.id, reason: `same model as ${twin.id}` });
      continue;
    }
    byKey.set(key, summary);

    const allAspects = imageCatalog.imageAspectRatioOptions(summary);
    const aspects = sortedUnique(allAspects.filter(isRatio), aspectRank);
    const resolutions = sortedUnique(imageCatalog.imageResolutionOptions(summary), imageSizeRank);
    const qualities = [...new Set(imageCatalog.imageQualityOptions(summary))];
    const limit = imageCatalog.imageReferenceLimit(summary);
    const accepts = imageCatalog.imageAcceptsReferences(summary) && limit !== 0;
    const minReferences = summary.supportedParameters?.input_references?.min ?? 0;
    const price = imagePrice(summary, resolutions, qualities, aspects);
    if (!price) skipped.push({ kind: 'image', model: summary.id, reason: 'no verified price, listed without one' });

    records.push({
      id: page?.slug ?? slugify(name),
      name,
      vendor,
      treza_page: page ? `${SITE}/models/${page.slug}` : null,
      aspect_ratios: aspects,
      aspect_ratio_auto: allAspects.includes('auto'),
      resolutions,
      max_resolution: resolutions.length ? resolutions[resolutions.length - 1] : null,
      quality_options: qualities,
      text_to_image: !(minReferences >= 1),
      reference_images: accepts,
      max_reference_images: accepts && typeof limit === 'number' ? limit : null,
      transparent_background: imageCatalog.imageBackgroundOptions(summary).includes('transparent'),
      price,
      shuts_down_on: modelRetirement(summary.id)?.on ?? null,
    });
  }
  return records;
}

// ---------------------------------------------------------------- main

const video = readVideoModels();
const image = readImageModels();
process.stdout.write(JSON.stringify({ video, image, skipped }));
