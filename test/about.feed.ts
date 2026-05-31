import type { Page } from '../src/spider.js';

const page: Page = {
  title: 'About',
  url: '/about.xml',
  template: registry => document => document.body(registry),
  body: () => 'This is a feed'
};

export default page;
