import test from 'tape';
import fsp from 'fs/promises';
import path from 'path';

import spider from './spider';
import setup from './spider.struct';

test('[spider] loads string html', async t => {
  const { file, cleanup } = await setup('export const url = "/";\nexport default "<p></p>"');

  try {
    const x = await spider()(file);

    t.equal(x.file, 'index.html', 'returns url');
    t.equal(x.html, '<p></p>', 'returns string html');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[spider] loads function html', async t => {
  const { file, cleanup } = await setup('export const url = "/about";\nexport default stats => `<p>${stats.ctimeMs}</p>;`');

  try {
    const x = await spider()(file);

    t.equal(x.file, 'about.html', 'returns url');
    t.true(/<p>\d+\.\d+<\/p>/.test(x.html), 'returns function html');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[spider] does not cache changes', async t => {
  const { file, cleanup } = await setup('export const url = "/a";\nexport default "<p></p>"');

  try {
    const x = await spider()(file);

    t.equal(x.file, 'a.html', 'returns url');
    t.equal(x.html, '<p></p>', 'returns string html');

    await fsp.writeFile(file, 'export const url = "/a/b";\nexport default "<p></p>"');

    const y = await spider()(file);

    t.equal(y.file, `a${path.sep}b.html`, 'returns uncached url');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[spider] adds outdir if set', async t => {
  const { file, cleanup } = await setup('export const url = "/about";\nexport default stats => `<p>${stats.ctimeMs}</p>;`');

  try {
    const x = await spider({ outdir: 'dist' })(file);

    t.equal(x.file, `dist${path.sep}about.html`, 'returns url');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[spider] resolves relative url', async t => {
  const { cleanup } = await setup('export const url = "/about";\nexport default stats => `<p>${stats.ctimeMs}</p>;`');

  try {
    await spider()('tmp/index.js');
    t.pass('resolves relative url');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[spider] writes html', async t => {
  const { cleanup } = await setup('export const url = "/about/me";\nexport default stats => `<p>${stats.ctimeMs}</p>;`');

  try {
    await spider({ write: true, outdir: 'tmp' })('tmp/index.js');
    await fsp.stat(path.join(process.cwd(), 'tmp/about/me.html'));

    t.pass('writes html');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[spider] throws on invalid url', async t => {
  const { file, cleanup } = await setup('export const url = 3;\nexport default "<p></p>"');

  try {
    await spider()(file);
    t.fail('Expected to throw');
  } catch (err) {
    t.pass((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[spider] accepts buffer', async t => {
  try {
    const x = await spider()(Buffer.from('export const url = "/";\nexport default "<p></p>"'));

    t.equal(x.file, 'index.html', 'returns url');
    t.equal(x.html, '<p></p>', 'returns string html');
  } catch (err) {
    t.fail((err as Error).message);
  }

  t.end();
});
