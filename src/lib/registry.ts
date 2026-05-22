import type Page from './page.ts';

export type Node = {
  page: Page;
  parent: Node | null;
  children: Node[];
};

export default class Registry {
  readonly #map: Map<string, Node>;
  readonly nodes: Node[];
  readonly tree: Node[];

  constructor(pages: Page[]) {
    this.nodes = [];
    this.tree = [];

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
        const parent: Node | null = (current?.children ?? this.tree).find(node => node.page.url === url) ?? null;
        if (parent) current = parent;
      }

      const node: Node = { page, parent: current, children: [] };
      this.nodes.push(node);
      if (current) {
        current.children.push(node);
      } else {
        this.tree.push(node);
      }
    }

    this.#map = new Map(this.nodes.map(node => [node.page.url, node]));
  }

  node(url: string): Node | null {
    return this.#map.get(url) ?? null;
  }
}
