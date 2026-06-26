import type { Draft } from '../src/spider.ts';

const page: Draft = {
  title: 'About',
  url: '/about.html',
  created: new Date('2020-01-01'),
  body: () => 'About'
};

export default page;
