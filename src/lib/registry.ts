import type { Page } from './document.ts';

import path from 'path';

export type Node = {
  parent: Node | null;
  children: Node[];
  value: Page;
};

export default (pages: Page[]): Map<string, Node> => pages
  .sort((a, b) => {
    const depth = (x: string) => x.split('/').length;

    if (depth(a.url) === depth(b.url)) return a.url.localeCompare(b.url);
    return depth(a.url) - depth(b.url);
  })
  .reduce((acc, cur) => {
    if (cur.url === '/') {
      const node: Node = { parent: null, children: [], value: cur };
      acc.set(cur.url, node);

      return acc;
    }

    const { dir } = path.parse(cur.url);
    let key = dir;
    if (dir !== '/') key += '/';

    const parent = acc.get(key);
    if (!parent) throw new Error(`Found unattached page "${cur.url}"`);

    const node: Node = { parent, children: [], value: cur };
    parent.children.push(node);
    acc.set(cur.url, node);

    return acc;
  }, new Map<string, Node>());
