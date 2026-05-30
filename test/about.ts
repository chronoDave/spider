import type { Page } from '../src/spider.js';

const page: Page = {
  title: 'About',
  url: '/about',
  created: new Date('2020-01-01'),
  body: () => 'About'
};

export default page;
