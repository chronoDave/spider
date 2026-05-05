import type { Page } from '../dist/spider.js';

const page: Page = {
  title: 'Blogs',
  template: () => body => body,
  body: () => 'This is a page'
};

export default page;
