import type { Draft } from '../src/spider.ts';

import h from '@chronocide/spark';

import template from './template/root.ts';

const page: Draft = {
  title: 'Home',
  url: '/',
  template,
  body: registry => h('main')()(
    h('p')()('This is a page'),
    h('a')({ href: registry.node('/about')?.page.url })(registry.node('/about')?.page.title)
  )
};

export default page;
