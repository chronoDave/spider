import type { Template } from '../../src/lib/load.ts';

import h from '@chronocide/spark';

const template: Template = () => body => {
  const template = h('html')({ lang: 'en-GB' })(
    h('head')()(h('title')()()),
    h('body')()(body)
  );

  return `<!DOCTYPE html>${template}`;
};

export default template;
