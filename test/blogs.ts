import type { Draft } from '../src/spider.js';

const page: Draft = {
  title: 'Blogs',
  template: registry => document => document.body?.(registry) ?? null,
  body: () => 'This is a page'
};

export default page;
