import type { Page } from '../src/lib/load.ts';

import h from '@chronocide/spark';

import template from './template/root.ts';

const page: Page = {
  title: 'Home',
  template,
  body: registry => h('main')()(
    h('p')()('This is a page'),
    h('a')({ href: registry.get('/about')?.url })(registry.get('/about')?.title)
  )
};

export default page;
