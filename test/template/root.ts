import type { Template } from '../../src/spider.js';

import h from '@chronocide/spark';

const template: Template = registry =>
  document => {
    const template = h('html')({ lang: 'en-GB' })(
      h('head')()(h('title')()()),
      h('body')()(document.body?.(registry))
    );

    return `<!DOCTYPE html>${template}`;
  };

export default template;
