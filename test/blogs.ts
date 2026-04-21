import type { Page } from '../src/lib/load.ts';

const page: Page = {
  title: 'Blogs',
  template: body => body,
  body: () => 'This is a page'
};

export default page;
