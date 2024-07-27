import { Stack, Typography } from '@mui/material';
import { Control, useForm } from 'react-hook-form';
import { CopyButton } from '~/features/ui/buttons/CopyButton';
import {
	FormDatePicker,
	FormInlineCheckbox,
	FormPatternFormatField,
	FormSelectChips,
	FormTextField,
	FormTimePicker,
} from '~/features/ui/form-inputs';
import { If } from '~/features/ui/util/If';

type Value = string | number | boolean | string[] | null;

type Props = {
	label: string;
	value: Value;
	name: string;
	type?: 'text' | 'select' | 'multiselect' | 'date' | 'time' | 'pattern' | 'checkbox';
	format?: string;
	options?: Array<{ label: string; value: string | number }>;
	print?: boolean;
	canCopy?: boolean;
	hideHeading?: boolean;
};

export const DataRenderer = ({
	label,
	value,
	name,
	print,
	type = 'text',
	canCopy = true,
	options,
	hideHeading,
	format,
}: Props) => {
	const { control } = useForm<Record<string, Value>>({ defaultValues: { [name]: value } });

	return (
		<Stack spacing={2} direction={print ? 'row' : 'column'}>
			<If condition={!hideHeading}>
				<Stack
					direction={'row'}
					sx={{ flexShrink: print ? 0 : 'unset' }}
					alignItems={'center'}
					justifyContent="space-between"
				>
					<If condition={type !== 'checkbox'}>
						<Typography variant={print ? 'body1' : 'body1b'}>{label}</Typography>
					</If>
					<If condition={['text', 'phone'].includes(type) && !print && canCopy}>
						<CopyButton getTextToCopy={() => value?.toString() ?? ''} />
					</If>
				</Stack>
			</If>
			<RenderFormInput
				type={type}
				label={label}
				name={name}
				options={options}
				format={format}
				control={control}
				readOnly
			/>
		</Stack>
	);
};

const RenderFormInput = ({
	type,
	options,
	format,
	...props
}: Pick<Props, 'label' | 'format' | 'name' | 'options' | 'type'> & {
	control: Control;
	readOnly: boolean;
}) => {
	switch (type) {
		case 'text':
			return <FormTextField {...props} />;
		case 'select':
			return <FormSelectChips {...props} options={options ?? []} />;
		case 'multiselect':
			return <FormSelectChips multiple {...props} options={options ?? []} />;
		case 'date':
			return <FormDatePicker {...props} />;
		case 'time':
			return <FormTimePicker {...props} />;
		case 'pattern':
			return (
				<FormPatternFormatField
					patternFormatProps={{
						format: format ?? '',
						mask: '_',
					}}
					{...props}
				/>
			);
		case 'checkbox':
			return <FormInlineCheckbox {...props} />;
		default:
			return null;
	}
};
