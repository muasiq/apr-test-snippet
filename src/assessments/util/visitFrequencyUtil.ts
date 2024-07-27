import {
	addDays,
	addWeeks,
	eachDayOfInterval,
	format,
	isFriday,
	isMonday,
	isSunday,
	isThursday,
	isTuesday,
	isWednesday,
	isWeekend,
	nextMonday,
	subDays,
} from 'date-fns';
import { isDate } from 'lodash';
export const frequencyOptions = [
	'Daily',
	'6x Weekly',
	'5x Weekly',
	'4x Weekly',
	'3x Weekly',
	'2x Weekly',
	'Weekly',
	'Every other week',
	'Monthly',
	'Start and Discharge Only',
] as const;

export type FrequencyOption = (typeof frequencyOptions)[number];

export const daysOfWeekOptions = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
] as const;
export type DaysOfWeekOption = (typeof daysOfWeekOptions)[number];

export function getDaysFromFrequency(frequency: FrequencyOption, startDate: Date, endDate: Date): DaysOfWeekOption[] {
	const days = generateDateFromFrequency(frequency, startDate, endDate);
	return Array.from(new Set(days.map((date) => format(date, 'EEEE') as DaysOfWeekOption))).sort(
		(a, b) => daysOfWeekOptions.indexOf(a) - daysOfWeekOptions.indexOf(b),
	);
}
export function generateDateFromFrequency(frequency: string, startDate: Date, endDate: Date) {
	if (startDate > endDate) return [];

	const allDays = getDaysBetweenDates(startDate, endDate);
	const weekDay = isWeekend(startDate) ? nextMonday(startDate) : startDate;

	switch (frequency) {
		case 'Daily':
			return allDays;
		case 'Weekly':
			return allDays.filter((date) => date.getDay() === weekDay.getDay());
		case '2x Weekly':
			return allDays.filter((date) => isThursday(date) || isTuesday(date));
		case '3x Weekly':
			return allDays.filter((date) => isMonday(date) || isWednesday(date) || isFriday(date));
		case '4x Weekly':
			return allDays.filter((date) => isMonday(date) || isTuesday(date) || isWednesday(date) || isThursday(date));
		case '5x Weekly':
			return allDays.filter((date) => !isWeekend(date));
		case '6x Weekly':
			return allDays.filter((date) => !isSunday(date));
		case 'Every other week':
			return allDays.filter((date) => date.getDay() === weekDay.getDay()).filter((_, index) => index % 2 === 0);
		case 'Monthly':
			return allDays.filter((date) => date.getDay() === weekDay.getDay()).filter((_, index) => index % 4 === 0);
		case 'Start and Discharge Only':
			return [startDate];
		default:
			return [];
	}
}

export function generateDateFromFrequencyAndWeeks(
	frequency: FrequencyOption,
	weeks: DaysOfWeekOption[] | null,
	startDate: Date,
	endDate: Date,
) {
	if (startDate > endDate) return [];

	if (!weeks) {
		return generateDateFromFrequency(frequency, startDate, endDate);
	}

	const allDays = getDaysBetweenDates(startDate, endDate).filter((date) =>
		weeks.includes(format(date, 'EEEE') as DaysOfWeekOption),
	);

	return allDays.filter((_, index) => {
		switch (frequency) {
			case 'Every other week':
				return index % 2 === 0;
			case 'Monthly':
				return index % 4 === 0;
			case 'Start and Discharge Only':
				return index === 0;
			default:
				return true;
		}
	});
}
export function generateRn02Date(lastDate: Date) {
	const date = subDays(lastDate, 4);
	if (isWeekend(date)) {
		return nextMonday(date);
	}
	return date;
}
export function resolveDateFromJson(date: Date | string) {
	if (isDate(date)) return date;
	return new Date(date);
}
export const getDaysBetweenDates = (startDate: Date, endDate: Date) => {
	return eachDayOfInterval({ start: addDays(startDate, 1), end: endDate });
};
export const getEndDate = (startDate: Date, numberOfWeeks: number) => {
	return addWeeks(startDate, numberOfWeeks);
};
