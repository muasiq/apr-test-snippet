import { format, formatDistance } from 'date-fns';

export function formatDateTime(date: Date | string) {
	return new Date(date).toLocaleString(undefined, {
		timeZoneName: 'short',
	});
}

export function formatDate(date: Date | string | undefined | null) {
	if (!date) return '';
	return format(new Date(date), 'MMMM d, yyyy');
}

export function formatDateShort(date: Date | string | undefined | null) {
	if (!date) return '';
	return format(new Date(date), 'MMMM d');
}

export function formatHour(date: Date | string | undefined | null) {
	if (!date) return null;
	return format(new Date(date), 'hh:mm aa');
}

export function formatTimeAgo(from: Date | string | undefined | null) {
	if (!from) return '';
	const fromDate = new Date(from);
	const now = new Date();
	return formatDistance(fromDate, now, { addSuffix: true });
}
