// import test from 'tape';
// import fsp from 'fs/promises';
// import path from 'path';

// import * as meta from './meta';

// const init = async () => {
//   const tmp = path.join(process.cwd(), 'tmp');

//   const invalid = {
//     array: path.join(tmp, 'object.json'),
//     url: path.join(tmp, 'url.json'),
//     path: path.join(tmp, 'path.json'),
//     redirects: path.join(tmp, 'redirects.json')
//   } as const;
//   const valid = path.join(tmp, 'valid.json');

//   await fsp.mkdir(tmp);
//   await Promise.all([
//     fsp.writeFile(invalid.array, '[]'),
//     fsp.writeFile(invalid.url, JSON.stringify({ url: 1 })),
//     fsp.writeFile(invalid.path, JSON.stringify({ url: '/ /' })),
//     fsp.writeFile(invalid.redirects, JSON.stringify({ redirects: [1] })),
//     fsp.writeFile(valid, JSON.stringify({ url: '/', redirects: [] }))
//   ]);

//   return {
//     valid,
//     invalid,
//     cleanup: () => fsp.rm(tmp, { recursive: true, force: true })
//   };
// };

// test('[meta.read] throws on invalid config', async t => {
//   const { invalid, cleanup } = await init();

//   await meta.read(invalid.array)
//     .then(() => t.fail('expected to throw'))
//     .catch(err => t.pass(err));

//   await meta.read(invalid.url)
//     .then(() => t.fail('expected to throw'))
//     .catch(err => t.pass(err));

//   await meta.read(invalid.path)
//     .then(() => t.fail('expected to throw'))
//     .catch(err => t.pass(err));

//   await meta.read(invalid.redirects)
//     .then(() => t.fail('expected to throw'))
//     .catch(err => t.pass(err));

//   await cleanup();
//   t.end();
// });

// test('[meta.read] passes on valid config', async t => {
//   const { valid, cleanup } = await init();

//   await meta.read(valid)
//     .then(raw => t.pass(JSON.stringify(raw)))
//     .catch(err => t.fail(err));

//   await cleanup();
//   t.end();
// });
