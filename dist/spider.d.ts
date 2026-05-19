export type Registry = Map<string, Page>;
export type Template = (registry: Registry) => (page: Page) => string;
export type Body = (registry: Registry) => string;
export type Draft = {
	title: string;
	description?: string;
	ext?: string;
	url?: string;
	created?: string;
	updated?: string;
	template: Template;
	body: Body;
};
export type PageOptions = {
	title: string;
	description: string | null;
	ext: string;
	url: string;
	created: Date;
	updated: Date | null;
	template: Template;
	body: Body;
};
export declare class Page {
	readonly title: string;
	readonly description: string | null;
	readonly ext: string;
	readonly url: string;
	readonly created: Date;
	readonly updated: Date | null;
	readonly body: Body;
	readonly template: Template;
	readonly file: string;
	readonly dir: string;
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
