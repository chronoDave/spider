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
	constructor(docs: Document[]);
	get list(): Node<Document>[];
	get tree(): Node<Document>[];
	get(url: string): Node<Document> | null;
}
export type Template = (registry: Registry) => (doc: Document) => string;
export type Body = (registry: Registry) => string;
export type Document = {
	readonly title: string;
	readonly description: string | null;
	readonly url: string;
	readonly created: Date | null;
	readonly updated: Date | null;
	readonly template: Template | null;
	readonly body: Body;
};
export type Draft = {
	title: string;
	description: string | null;
	url: string | null;
	ext: string | null;
	created: Date | null;
	updated: Date | null;
	template: Template | null;
	body: Body;
};
export type Loader = (file: string) => Promise<Draft>;
declare const js: Loader;
declare const md: Loader;
export type Page = {
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
	/** Load file */
	load(file: string): Promise<Document>;
	/** Write documents to `outdir` */
	write(): Promise<void>;
	build(): Promise<Map<string, Document>>;
}

declare namespace loader {
	export { Draft, Loader, js, md };
}

export {
	Spider as default,
	loader,
};

export {};
