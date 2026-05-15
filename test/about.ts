import type { Draft } from '../src/spider.js';

import template from './template/root.ts';

const page: Draft = {
  title: 'About',
  created: '2020-01-01',
  template,
  body: () => 'This is a page'
};

export default page;
