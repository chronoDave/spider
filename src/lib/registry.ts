import type Page from './page.ts';

export type Node = {
  page: Page;
  parent: Node | null;
  children: Node[];
};

export default class Registry {
  readonly #map: Map<string, Page>;
  readonly pages: Page[];
  readonly tree: Node[];

  static trie(pages: Page[]): Node[] {
    const trie: Node[] = [];

    for (const page of pages.sort((a, b) => a.depth - b.depth)) {
      /**
       * / => []
       * /a => ['a']
       * /a/b => ['a', 'b']
       * /a/b/c => ['a', 'b', 'c']
       */
      const dirs = page.url.split('/').filter(Boolean);

      /**
       * [] => null
       * ['a'] => '/'
       * ['a', 'b'] => '/a'
       * ['a', 'b', 'c'] => '/a/b'
       */
      let current: Node | null = null;
      for (let i = 0; i < dirs.length; i += 1) {
        const url = i === 0 ? '/' : `/${dirs.slice(0, i).join('/')}`;
        // @ts-expect-error: TS2339, "Property 'children' does not exist in type 'never'. (property) children: Node[] | undefined"
        const parent: Node | null = (current?.children ?? trie).find(node => node.page.url === url) ?? null;
        if (parent) current = parent;
      }

      if (current) {
        current.children.push({ page, parent: current, children: [] });
      } else {
        trie.push({ page, parent: null, children: [] });
      }
    }

    return trie;
  }

  constructor(pages: Page[]) {
    this.pages = pages;
    this.tree = Registry.trie(pages);
    this.#map = new Map(pages.map(page => [page.url, page]));
  }

  get(url: string): Page | null {
    return this.#map.get(url) ?? null;
  }
}
