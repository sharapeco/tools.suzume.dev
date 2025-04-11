export type PageData = {
	tools: ToolDef[];
};

export type ToolDef = {
	icon: string;
	title: string;
	route: string;
	description: string;
	disabled: boolean;
};
