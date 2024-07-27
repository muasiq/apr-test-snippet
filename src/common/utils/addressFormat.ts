interface Address {
	address1?: string | null;
	address2?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
}
export const addressFormat = (address: Address, options: { singleLine: boolean } = { singleLine: false }) => {
	if (!address.address1) {
		return '';
	}
	const delimiter = options?.singleLine ? ', ' : '\n';
	return `${address.address1}${address.address2 ? ` ${address.address2}` : ''}${delimiter}${address.city}, ${address.state} ${
		address.zip
	}`;
};
