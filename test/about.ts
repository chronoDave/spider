import type { Page } from '../src/spider.js';

const page: Page = {
  title: 'About',
  url: '/about.html',
  created: new Date('2020-01-01'),
  body: () => 'About'
};

export default page;
