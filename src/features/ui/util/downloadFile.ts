export function downloadFile(href: string, name?: string) {
	const link = document.createElement('a');
	link.href = href;
	if (name) {
		link.download = name;
	}
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
