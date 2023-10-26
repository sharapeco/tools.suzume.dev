export type PageData = {
	tools: ToolDef[];
}

export type ToolDef = {
	title: string;
	route: string;
	description: string;
	disabled: boolean;
};
