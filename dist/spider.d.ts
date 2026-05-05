export type Template = (registry: Map<string, Document>) => (body: string) => string;
export type Page = {
	title: string;
	description?: string;
	ext?: string;
	url?: string;
	created?: string;
	updated?: string;
	template: Template;
	body: (registry: Map<string, Document>) => string;
};
type DocumentOptions = {
	title: string;
	description: string | null;
	ext: string;
	url: string;
	created: Date;
	updated: Date | null;
	template: Template;
	body: (registry: Map<string, Document>) => string;
};
declare class Document {
	#private;
	readonly title: string;
	readonly description: string | null;
	readonly url: string;
	readonly created: Date;
	readonly updated: Date | null;
	readonly body: (registry: Map<string, Document>) => string;
	constructor(options: DocumentOptions);
	/** Return page level */
	get level(): number;
	/** Return file directory */
	get dir(): string;
	/** Return file url */
	get file(): string;
	/** Render page (template + body) */
	render(registry: Map<string, Document>): string;
}
export type LoadContext = {
	root: string;
	file: string;
};
export type LoadResult = DocumentOptions;
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
declare const _default: (options: SpiderOptions) => Promise<Map<string, Document>>;

export {
	_default as default,
};

export {};
