export type Node<T> = {
	value: T;
	parent: Node<T> | null;
	children: Array<Node<T>>;
};
export type Tree<T> = {
	flat: Array<Node<T>>;
	nested: Array<Node<T>>;
};
export declare class Registry {
	#private;
	constructor(pages: Page[]);
	get list(): Node<Page>[];
	get tree(): Node<Page>[];
	get(url: string): Node<Page> | null;
}
export type Template = (registry: Registry) => (page: Page) => string;
export type Body = (registry: Registry) => string;
export type Page = {
	readonly title: string;
	readonly description: string | null;
	readonly url: string;
	readonly created: Date | null;
	readonly updated: Date | null;
	readonly body: Body;
};
export declare class Document {
	#private;
	readonly file: string;
	readonly page: Page;
	/**
	 * Create document file path
	 *
	 * - `/` + `index` => `/index.html`
	 * - `/` + `about` => `/about/index.html`
	 * - `/` + `about.html` => `/about.html`
	 * - `/` + `about.xml` => `/about.xml`
	 * - `/about` + `index` => `/about/index.html`
	 * - `/about` + `me` => `/about/me/index.html`
	 * - `/about` + `about` => `/about/index.html`
	 * - `/about` + `about.html` => `/about/about.html`
	 * - `/about` + `about.xml` => `/about/about.xml`
	 */
	static file(dir: string, result: LoaderResult): string;
	/**
	 * Create document url
	 *
	 * - `/` + `index` => `/`
	 * - `/` + `about` => `/about/`
	 * - `/` + `about.html` => `/about`
	 * - `/` + `about.xml` => `/about.xml`
	 * - `/about` + `index` => `/about/`
	 * - `/about` + `me` => `/about/me/`
	 * - `/about` + `about` => `/about/`
	 * - `/about` + `about.html` => `/about/about`
	 * - `/about` + `about.xml` => `/about/about.xml`
	 */
	static url(file: string, result: LoaderResult): string;
	constructor(dir: string, result: LoaderResult);
	render(registry: Registry): string;
}
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
		body: Body;
	};
};
export type Loader = (file: string) => Promise<LoaderResult>;
declare const js: Loader;
declare const md: Loader;
export type Draft = {
	title: string;
	description?: string;
	url?: string;
	ext?: string;
	created?: Date;
	updated?: Date;
	template?: Template;
	body: Body;
};
export type SpiderOptions = {
	/** Supports [Node globs](https://github.com/isaacs/minimatch#features) */
	entryPoints: string[];
	/** Supports [Node globs](https://github.com/isaacs/minimatch#features) */
	exclude?: string[];
	/** Output directory */
	outdir?: string;
	/** Base directory */
	root?: string;
	/** File loaders */
	loader?: Record<string, Loader>;
};
declare class Spider {
	#private;
	constructor(options: SpiderOptions);
	/**
	 * Load file
	 *
	 * @param file Input file, must default export a `Draft`
	 * @param force If true, overwrites cached entry
	 */
	load(file: string, force?: boolean): Promise<Document>;
	/** Write cached documents to `outdir` */
	write(): Promise<void>;
	/** Find all files in `entryPoints`, loads and writes to `outdir` */
	build(): Promise<Map<string, Document>>;
	/**
	 * Watch `entryPoints` and dependencies. Calls `build` on file changes.
	 *
	 * **Note**: Files that exist outside the working directly do not trigger a build.
	 *
	 * **Note**: Due to Node's [limitations](https://github.com/nodejs/node/issues/49442#issuecomment-1894620232), every file change will
	 * increase memory usage. It is not recommended to run `watch` for extended periods of time.
	 */
	watch(): Promise<() => void>;
}

declare namespace loader {
	export { Loader, LoaderResult, js, md };
}

export {
	Spider as default,
	loader,
};

export {};
