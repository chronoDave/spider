import * as string from './string.ts';

export type PageOptions = {
  title: string;
  description: string | null;
  /** Relative URL */
  url: string;
  created: Date;
  updated: Date | null;
  body: () => string;
  template: () => (body: string) => string;
};

export default class Page {
  readonly title: string;
  readonly description: string | null;
  /** Relative URL */
  readonly url: string;
  readonly created: Date;
  readonly updated: Date | null;
  readonly body: () => string;
  readonly #template: () => (body: string) => string;

  constructor(options: PageOptions) {
    this.#template = options.template;

    this.title = options.title;
    this.description = options.description;
    this.url = options.url;
    this.created = options.created;
    this.updated = options.updated;
    this.body = options.body;
  }

  /** Return page level */
  get level(): number {
    return string.count('/')(this.url);
  }

  /** Render page (template + body) */
  render(): string {
    return this.#template()(this.body());
  }
}
