import type { Page } from '../src/spider.js';

const page: Page = {
  title: 'Blogs',
  template: registry => document => document.body(registry),
  body: () => 'This is a page'
};

export default page;
