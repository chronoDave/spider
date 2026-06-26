import type { Draft } from '../src/spider.js';

const page: Draft = {
  title: 'About',
  url: '/about.xml',
  template: registry => document => document.body(registry),
  body: () => 'This is a feed'
};

export default page;
