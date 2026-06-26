import type { Page } from './document.ts';
import type { Tree, Node } from './array.ts';

import * as array from './array.ts';

export default class Registry {
  readonly #map: Map<string, Node<Page>>;
  readonly #tree: Tree<Page>;

  constructor(pages: Page[]) {
    this.#tree = array.tree(pages)((page, tree) => {
      let current = null as Node<Page> | null;

      /**
       * / => []
       * /a/ => ['a']
       * /a/b/ => ['a', 'b']
       * /a/b/c/ => ['a', 'b', 'c']
       */
      const dirs = page.url.split('/').filter(Boolean);

      /**
       * [] => null
       * ['a'] => '/'
       * ['a', 'b'] => '/a'
       * ['a', 'b', 'c'] => '/a/b'
       */
      for (let i = 0; i < dirs.length; i += 1) {
        const url = i === 0 ? '/' : `/${dirs.slice(0, i).join('/')}/`;
        const parent = (current?.children ?? tree).find(node => node.value.url === url) ?? null;

        if (parent) current = parent;
      }

      return current;
    });

    this.#map = new Map(this.#tree.flat.map(node => [node.value.url, node]));
  }

  get list() {
    return this.#tree.flat;
  }

  get tree() {
    return this.#tree.nested;
  }

  get(url: string): Node<Page> | null {
    return this.#map.get(url) ?? null;
  }
}
