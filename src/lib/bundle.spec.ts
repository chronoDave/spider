import test from 'tape';
import fsp from 'fs/promises';
import path from 'path';

import { bundle } from './bundle';
import init from './bundle.struct';

test('[bundle] throws on invalid page', async t => {
  const { invalid, cleanup } = await init();

  await bundle(invalid.url)
    .then(() => t.fail('expected to throw `url`'))
    .catch(err => t.pass(err));

  await bundle(invalid.html)
    .then(() => t.fail('expected to throw `html`'))
    .catch(err => t.pass(err));

  await bundle(invalid.redirects)
    .then(() => t.fail('expected to throw `redirects`'))
    .catch(err => t.pass(err));

  await cleanup();
  t.end();
});

test('[bundle] returns null on empty file', async t => {
  const { empty, cleanup } = await init();

  try {
    const result = await bundle(empty);

    t.equal(result, null, 'empty string');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[bundle] passes on page url', async t => {
  const { valid, cleanup } = await init();

  try {
    const result = await bundle(valid);

    t.notEqual(result, null, 'is valid page');
    t.deepEqual(result?.redirects, [], 'redirects');
    t.equal(result?.path, 'index.html', 'path');
    t.equal(result?.html, '<!doctype html><html lang=`en`><title>.</title></html>', 'html');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[bundle] passes on page buffer', async t => {
  const { nested, cleanup } = await init();

  try {
    const result = await bundle(await fsp.readFile(nested));

    t.deepEqual(result?.redirects, [], 'redirects');
    t.equal(result?.path, path.normalize('/chronocide/spider.html'), 'path');
    t.equal(result?.html, '<!doctype html><html lang=`en`><title>.</title></html>', 'html');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});
