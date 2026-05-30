export type Node = Document & {
	parent: Node | null;
	children: Node[];
};
export declare class Registry {
	#private;
	readonly nodes: Node[];
	readonly tree: Node[];
	constructor(docs: Document[]);
	node(url: string): Node | null;
}
export type Template = (registry: Registry) => (doc: Document) => string;
export type Body = (registry: Registry) => string;
export type Document = {
	readonly title: string;
	readonly description: string | null;
	readonly url: string;
	readonly ext: string;
	readonly created: Date;
	readonly updated: Date | null;
	readonly template: Template | null;
	readonly body: Body;
};
export type Draft = {
	title: string;
	description: string | null;
	url: string | null;
	ext: string;
	created: Date;
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
	/** File globs */
	files: string[];
	/** Filter out files / directories using glob patterns from src */
	exclude?: string[];
	/** Base directory */
	root?: string;
	/** Output directory. If empty, does not write files */
	dirout?: string;
	/** File loaders */
	loader?: Record<string, Loader>;
};
declare class Spider {
	#private;
	constructor(options: SpiderOptions);
	/** Write registry to `dirout` */
	write(): Promise<Registry>;
	/** Load file into registry */
	load(file: string): Promise<void>;
	/** Build project */
	build(): Promise<Registry>;
}

declare namespace loader {
	export { Draft, Loader, js, md };
}

export {
	Spider as default,
	loader,
};

export {};
