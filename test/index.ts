import type { Page } from '../src/spider.ts';

import h from '@chronocide/spark';

import template from './template/root.ts';

const page: Page = {
  title: 'Home',
  url: '/',
  template,
  body: registry => h('main')()(
    h('p')()('This is a page'),
    h('a')({ href: registry.get('/about/')?.value.url })(registry.get('/about/')?.value.title)
  )
};

export default page;
