import type { Template } from '../../dist/spider.js';

import h from '@chronocide/spark';

const template: Template = () => body => {
  const template = h('html')({ lang: 'en-GB' })(
    h('head')()(h('title')()()),
    h('body')()(body)
  );

  return `<!DOCTYPE html>${template}`;
};

export default template;
