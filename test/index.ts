import Spider from '../src/spider.ts';

const spider = new Spider({ dirout: 'build' });
spider.add({
  url: '/',
  title: 'spider',
  content: 'abc'
});

spider.build();
