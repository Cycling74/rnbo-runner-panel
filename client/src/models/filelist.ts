export type FileListItem = {
	name: string,
	uri: string,
	dir: boolean
};

export type FileList = {
	filetype: string,
	items: FileListItem[]
};
