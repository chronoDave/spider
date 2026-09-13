import type { Body, Template } from './document.ts';

import * as parse from './parse.ts';
import * as esm from './esm.ts';
import { maybe } from './fn.ts';

export type LoaderResult = {
  dependencies: Set<string>;
  page: {
    title: string;
    description: string | null;
    url: string | null;
    ext: string | null;
    created: Date | null;
    updated: Date | null;
    template: Template | null;
    body: Body | null;
  };
};

export type Loader = (file: string) => Promise<LoaderResult>;

export const js: Loader = async file => {
  const [
    module,
    dependencies
  ] = await Promise.all([
    esm.load(file).then(result => parse.object('default')(result.default)),
    esm.imports(new Set())(file)
  ]);

  return {
    dependencies,
    page: {
      title: parse.string('title')(module.title),
      description: maybe(parse.string('description'))(module.description),
      url: maybe(parse.string('url'))(module.url),
      ext: maybe(parse.string('ext'))(module.ext),
      created: maybe(parse.date('created'))(module.created),
      updated: maybe(parse.date('updated'))(module.updated),
      template: maybe(parse.fn<Template>('template'))(module.template),
      body: maybe(parse.fn<Body>('body'))(module.body)
    }
  };
};
