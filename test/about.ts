import type { Page } from '../src/lib/load.ts';

import template from './template/root.ts';

const page: Page = {
  title: 'About',
  created: '2020-01-01',
  template,
  body: () => 'This is a page'
};

export default page;
