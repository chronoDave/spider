export type Template = (registry: Map<string, LoadResult>) => (document: LoadResult) => string;
export type Body = (registry: Map<string, LoadResult>) => string;
export type Page = {
	title: string;
	description?: string;
	ext?: string;
	url?: string;
	created?: string;
	updated?: string;
	template: Template;
	body: Body;
};
export type LoadContext = {
	root: string;
	file: string;
};
export type LoadResult = {
	title: string;
	description: string | null;
	ext: string;
	url: string;
	created: Date;
	updated: Date | null;
	template: Template;
	body: Body;
};
export type Loader = (context: LoadContext) => Promise<LoadResult>;
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
declare const _default: (options: SpiderOptions) => Promise<Map<string, LoadResult>>;

export {
	_default as default,
};

export {};
