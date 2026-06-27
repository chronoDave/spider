import type { Draft } from '../src/spider.ts';

const page: Draft = {
  title: 'Blogs',
  template: registry => document => document.body(registry),
  body: () => 'This is a page'
};

export default page;
