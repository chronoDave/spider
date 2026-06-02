import type { Node } from './array.ts';

import test from 'node:test';

import * as array from './array.ts';
import * as string from './string.ts';

test('[array.tree]', t => {
  const depth = string.count('/');
  const arr = ['/b/c/', '/', '/b/', '/a/', '/e/', '/f/', '/f/g/', '/b/c/d/', '/f/g.html', '/a.xml']
    .sort((a, b) => {
      if (depth(a) === depth(b)) return a.localeCompare(b);
      return depth(a) - depth(b);
    });
  const tree = array.tree(arr)((x, tree) => {
    const dirs = x.split('/').filter(Boolean);

    let node: Node<string> | null = null as Node<string> | null;
    for (let i = 0; i < dirs.length; i += 1) {
      const url = i === 0 ? '/' : `/${dirs.slice(0, i).join('/')}/`;
      const parent: Node<string> | null = (node?.children ?? tree)
        .find(node => node.value === url) ?? null;

      if (parent) node = parent;
    }

    return node;
  });

  t.assert.equal(tree.flat.length, arr.length, 'has entries');
  t.assert.equal(tree.nested.length, 1, 'has single root (/)');
  t.assert.equal(tree.nested[0].children.length, 5, 'has children (/)');
  t.assert.equal(tree.nested[0].children[2].children.length, 1, 'has nested children (/b/c/d)');
});
