/**
 * Checks the generated files: each matches data/schema.json, and the rules
 * the schema cannot state hold too (order, unique ids, prices to the cent,
 * every listed length priced, README tables in step with the JSON).
 *
 *   npm test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020').default;
const addFormats = require('ajv-formats').default;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');
const schema = JSON.parse(read('data/schema.json'));
const files = {
  video: JSON.parse(read('data/video-models.json')),
  image: JSON.parse(read('data/image-models.json')),
};

const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const cents = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;
const tenthsOfCents = (n: number) => Math.abs(n * 1000 - Math.round(n * 1000)) < 1e-9;

for (const [kind, file] of Object.entries(files)) {
  test(`${kind}: matches data/schema.json`, () => {
    const ok = validate(file);
    assert.ok(ok, ajv.errorsText(validate.errors, { separator: '\n' }));
    assert.equal(file.kind, kind);
  });

  test(`${kind}: count, unique ids, sorted by vendor then name`, () => {
    assert.equal(file.count, file.models.length);
    assert.ok(file.models.length > 0);
    const ids = file.models.map((m: { id: string }) => m.id);
    assert.equal(new Set(ids).size, ids.length, 'ids repeat');
    const sorted = [...file.models].sort(
      (a: { vendor: string; name: string }, b: { vendor: string; name: string }) =>
        a.vendor.localeCompare(b.vendor, 'en', { sensitivity: 'base' }) ||
        a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' })
    );
    assert.deepEqual(file.models.map((m: { id: string }) => m.id), sorted.map((m: { id: string }) => m.id));
  });

  test(`${kind}: a Treza page link is that model's own page`, () => {
    for (const m of file.models) {
      if (m.treza_page) assert.equal(m.treza_page, `https://www.trezalabs.com/models/${m.id}`, m.id);
    }
  });

  test(`${kind}: no model is announced as already shut down`, () => {
    for (const m of file.models) {
      if (m.shuts_down_on) assert.ok(m.shuts_down_on >= file.updated, `${m.id} shut down on ${m.shuts_down_on}`);
    }
  });
}

test('video: every listed length has a clip price, to the cent, rising with length', () => {
  for (const m of files.video.models) {
    if (!m.price) continue;
    const lengths = Object.keys(m.price.clips).map(Number);
    assert.deepEqual(lengths, m.lengths_seconds, `${m.id}: clip prices do not match lengths_seconds`);
    let previous = 0;
    for (const seconds of m.lengths_seconds) {
      const usd = m.price.clips[String(seconds)];
      assert.ok(cents(usd), `${m.id} ${seconds} s: ${usd} is not whole cents`);
      assert.ok(usd >= previous, `${m.id}: ${seconds} s costs less than a shorter clip`);
      previous = usd;
    }
    for (const r of [m.price.per_second, ...Object.values(m.price.per_second_by_resolution ?? {})] as number[]) {
      assert.ok(tenthsOfCents(r), `${m.id}: rate ${r} has more than three decimals`);
    }
  }
});

test('video: a clip above any minimum costs its per-second rate times its length', () => {
  for (const m of files.video.models) {
    if (!m.price) continue;
    for (const seconds of m.lengths_seconds) {
      if (m.price.minimum_billed_seconds && seconds <= m.price.minimum_billed_seconds) continue;
      const expected = m.price.per_second * seconds;
      // The clip is rounded once from the exact rate, the per-second rate separately.
      assert.ok(Math.abs(m.price.clips[String(seconds)] - expected) <= 0.0005 * seconds + 0.0051, `${m.id} ${seconds} s`);
    }
  }
});

test('video: specs agree with each other', () => {
  for (const m of files.video.models) {
    if (!m.text_to_video) assert.ok(m.first_frame, `${m.id} needs an image it cannot take`);
    if (m.last_frame) assert.ok(m.first_frame, `${m.id}: last frame without a first frame`);
    if (m.resolutions.length || m.default_resolution) assert.ok(m.max_resolution, `${m.id}: no max resolution`);
    if (m.price?.per_second_by_resolution) {
      for (const tier of Object.keys(m.price.per_second_by_resolution)) assert.ok(m.resolutions.includes(tier), `${m.id}: ${tier}`);
      const atTier = m.price.resolution ? m.price.per_second_by_resolution[m.price.resolution] : undefined;
      if (atTier !== undefined) assert.equal(atTier, m.price.per_second, `${m.id}: per_second is not the ${m.price.resolution} rate`);
    }
  }
});

test('image: prices to the cent, settings priced only where they are offered', () => {
  for (const m of files.image.models) {
    if (!m.price) continue;
    assert.ok(cents(m.price.per_image), `${m.id}: ${m.price.per_image}`);
    for (const [key, offered] of [
      ['by_resolution', m.resolutions],
      ['by_quality', m.quality_options],
      ['by_aspect_ratio', m.aspect_ratios],
    ] as const) {
      const map = m.price[key];
      if (!map) continue;
      for (const [setting, usd] of Object.entries(map)) {
        assert.ok(offered.includes(setting), `${m.id}: ${key} prices ${setting}, which it does not offer`);
        assert.ok(cents(usd as number), `${m.id} ${setting}: ${usd}`);
      }
    }
    if (!m.reference_images) assert.equal(m.price.per_reference_image, null, m.id);
  }
});

test('README: tables list every model and carry the date of the newest file', () => {
  const readme = read('README.md');
  const section = (marker: string) => {
    const start = readme.indexOf(`<!-- ${marker}:start -->`);
    const end = readme.indexOf(`<!-- ${marker}:end -->`);
    assert.ok(start >= 0 && end > start, `README.md is missing the ${marker} markers`);
    return readme.slice(start, end);
  };
  for (const [kind, marker] of [['video', 'video-models'], ['image', 'image-models']] as const) {
    const rows = section(marker).split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('| Model') && !line.startsWith('| ---'));
    assert.equal(rows.length, files[kind].models.length, `${marker}: row count`);
    files[kind].models.forEach((m: { name: string }, i: number) => assert.ok(rows[i].startsWith(`| ${m.name} |`), `${marker} row ${i}`));
  }
  const newest = [files.video.updated, files.image.updated].sort().at(-1);
  assert.ok(section('updated').includes(`Updated ${newest}:`));
});
