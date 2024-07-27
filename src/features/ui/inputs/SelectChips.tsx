import { Box, Chip, MenuItem, TextField, type TextFieldProps } from '@mui/material';
import { isArray, isNil } from 'lodash';
import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

export type SelectOptionType = {
	label: string | number;
	value: string | number;
};

type BaseProps = {
	options: SelectOptionType[];
	multiple?: boolean;
	readOnly?: boolean;
	freeSolo?: boolean;
	error?: FieldError;
	value?: SelectOptionType['value'] | SelectOptionType['value'][];
} & Omit<TextFieldProps, 'value' | 'error'>;

const chipSX = {
	height: 'auto',
	'& .MuiChip-label': {
		display: 'block',
		whiteSpace: 'normal',
	},
};

function ensureValidValue(
	value: (string | number | null | undefined)[] | string | number | null | undefined,
	multiple: boolean,
) {
	if (multiple) {
		if (isArray(value)) {
			return value.filter((v) => !isNil(v));
		}
		return isNil(value) ? [] : [value];
	}
	return value;
}

export const SelectChips = forwardRef<HTMLInputElement, BaseProps>(
	(
		{
			SelectProps,
			label,
			value,
			onChange,
			options,
			error,
			multiple = false,
			readOnly = false,
			freeSolo = false,
			...props
		},
		ref,
	) => {
		return (
			<TextField
				{...props}
				value={ensureValidValue(value, multiple)}
				onChange={onChange}
				label={label}
				select
				error={!!error}
				helperText={error ? error.message : ''}
				fullWidth
				InputProps={{
					readOnly,
				}}
				inputRef={ref}
				SelectProps={{
					...SelectProps,
					multiple,
					renderValue: (selected) => {
						return (
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
								{renderValue(selected as string | string[], multiple, options, freeSolo)}
							</Box>
						);
					},
				}}
			>
				{options?.map((option, index) => (
					<MenuItem key={index} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</TextField>
		);
	},
);

SelectChips.displayName = 'SelectChips';

function renderValue(
	selected: string | string[],
	multiple: boolean,
	options: SelectOptionType[],
	freeSolo: boolean,
): JSX.Element | JSX.Element[] {
	if (multiple) {
		if (isArray(selected)) {
			if (freeSolo) {
				return selected.map((value, index) => renderChip(value, options, index, freeSolo));
			}
			const result = options.map((item) => item.value).filter((item) => selected.includes(item as string));
			return result.map((value, index) => renderChip(value as string, options, index, freeSolo));
		}
	}
	return renderChip(selected as string, options, 0, freeSolo);
}

function renderChip(
	selected: string,
	options: SelectOptionType[],
	key: string | number,
	freeSolo: boolean,
): JSX.Element {
	const label = freeSolo ? selected : findLabelByValue(selected, options);
	return <Chip sx={chipSX} label={label} key={key} />;
}

function findLabelByValue(value: string | number, options: SelectOptionType[]): string | number {
	const foundOption = options.find((option) => option.value === value);
	if (!foundOption) {
		console.error(`Cannot find option for value: ${value}`);
	}
	return foundOption?.label ?? '';
}
