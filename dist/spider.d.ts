export type Node = {
	page: Page;
	parent: Node | null;
	children: Node[];
};
export declare class Registry {
	#private;
	readonly nodes: Node[];
	readonly tree: Node[];
	constructor(pages: Page[]);
	node(url: string): Node | null;
}
export type Template = (registry: Registry) => (page: Page) => string | null;
export type Body = (registry: Registry) => string | null;
export type Draft = {
	title: string;
	description?: string;
	ext?: string;
	url?: string;
	created?: string;
	updated?: string;
	template?: Template;
	body?: Body;
};
export type PageOptions = {
	title: string;
	description: string | null;
	ext: string;
	url: string;
	created: Date;
	updated: Date | null;
	template: Template | null;
	body: Body | null;
};
export declare class Page {
	readonly title: string;
	readonly description: string | null;
	readonly ext: string;
	readonly url: string;
	readonly created: Date;
	readonly updated: Date | null;
	readonly body: Body | null;
	readonly template: Template | null;
	readonly file: string;
	readonly dir: string;
	readonly depth: number;
	constructor(options: PageOptions);
	render(registry: Registry): string;
}
export type Loader = (root: string) => (file: string) => Promise<PageOptions>;
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

export {
	Spider as default,
};

export {};
