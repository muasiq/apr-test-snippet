import { Check, Close, Delete } from '@mui/icons-material';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { Control, useController } from 'react-hook-form';
import { FormTextField } from '~/features/ui/form-inputs';
import { VitalSignConfigFormInput } from '~/server/api/routers/organization/organization.inputs';
import theme from '~/styles/theme';
import { vitalSignParamFieldGroups } from './vitalSignConfig.utils';

type VitalSignParamsFormProps = {
	control: Control<VitalSignConfigFormInput>;
	index: number;
	isDirty: boolean;
	onUpdate: () => void;
	onDelete: () => void;
	onReset: () => void;
};

export function VitalSignConfigsForm({
	control,
	index,
	isDirty,
	onUpdate,
	onDelete,
	onReset,
}: VitalSignParamsFormProps) {
	const fieldName = `configs.${index}` as const;
	const field = useController({ name: fieldName, control });

	return (
		<>
			<Stack direction="row" mb={3} alignItems="center" justifyContent="space-between">
				<FormTextField
					control={control}
					name={`${fieldName}.name`}
					label="Configuration Name"
					size="small"
					disabled={index === 0}
					data-cy={`vital-sign-name-${index}`}
				/>
				<Stack direction="row" justifyItems="flex-end">
					{isDirty ? (
						<>
							<IconButton
								type="submit"
								aria-label="accept"
								size="small"
								data-cy={'row-confirm-button-' + index}
								onClick={() => onUpdate()}
								sx={{ color: theme.palette.success.main }}
							>
								<Check />
							</IconButton>
							<Divider orientation="vertical" flexItem />
							<IconButton
								size="small"
								type="button"
								aria-label="cancel"
								data-cy={'vital-sign-row-edit-cancel-btn-' + index}
								onClick={() => onReset()}
								disabled={field.field.value.id === undefined}
								sx={{ color: theme.palette.error.main }}
							>
								<Close />
							</IconButton>
						</>
					) : (
						<IconButton
							type="button"
							size="small"
							aria-label="delete"
							data-cy={'vital-sign-row-delete-btn-' + index}
							onClick={() => onDelete()}
							disabled={index === 0}
							sx={{ color: theme.palette.error.main }}
						>
							<Delete />
						</IconButton>
					)}
				</Stack>
			</Stack>

			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
					rowGap: 2,
					columnGap: { xs: 2 },
				}}
			>
				{vitalSignParamFieldGroups.map(({ group, fields }) => (
					<Stack key={group} direction="column" spacing={1}>
						<Typography variant="body2" fontWeight="bold">
							{group}
						</Typography>
						<Box sx={{ display: 'grid', gridTemplateColumns: `1fr 1fr`, gap: 2 }}>
							{fields.map((field) => (
								<FormTextField
									key={field.name}
									control={control}
									name={`${fieldName}.${field.name}`}
									size="small"
									type="number"
									label={field.label}
									data-cy={`vital-sign-${field.name}`}
									fullWidth
								/>
							))}
						</Box>
					</Stack>
				))}
			</Box>
		</>
	);
}
