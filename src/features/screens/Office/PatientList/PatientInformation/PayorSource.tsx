import { Box, Grid, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { ArrayPath, Control, Path, useFieldArray, useWatch } from 'react-hook-form';
import { allOasisQuestions } from '~/assessments/oasis/data-files';
import { AddAndRemoveButtons } from '~/features/screens/Field/PatientDetail/components/AddAndRemoveButtons';
import { FormSelect, FormSelectChips, FormTextField } from '~/features/ui/form-inputs';
import { If } from '~/features/ui/util/If';
import { CreatePatientInput } from '~/server/api/routers/patient/patient.inputs';
import { getCanAnswer } from '~/server/api/routers/patient/patient.util';
import { getAddButtonTextForFieldArray } from './util/fieldArrayUtil';

type Props = {
	control: Control<CreatePatientInput>;
	formReadonly?: boolean;
	payorSourceTypeOptions: string[];
};

export const PayorSource = ({ control, formReadonly, payorSourceTypeOptions }: Props): JSX.Element => {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'PayorSources' as ArrayPath<CreatePatientInput>,
	});

	const M0150Answer = useWatch({ control, name: 'M0150Answer' });

	const M0150 = useMemo(() => allOasisQuestions.find((q) => q.id === 'M0150'), []);
	const M0063 = useMemo(() => allOasisQuestions.find((q) => q.id === 'M0063'), []);
	const M0065 = useMemo(() => allOasisQuestions.find((q) => q.id === 'M0065'), []);
	const M0150_specify = useMemo(() => allOasisQuestions.find((q) => q.id === 'M0150_specify'), []);

	const addButtonText = getAddButtonTextForFieldArray(fields, 'Payor Source', undefined, true);

	return (
		<Stack rowGap={2}>
			<Typography variant="h6">Payor Details</Typography>
			<Grid container spacing={2}>
				<If condition={!!M0150}>
					<Grid item xs={12}>
						<FormSelectChips
							control={control}
							multiple
							data-cy="m0150-answer"
							name="M0150Answer"
							label={M0150?.shortName ?? ''}
							options={M0150?.responses?.map((r) => ({ label: r.text, value: `${r.code}` })) ?? []}
							readOnly={formReadonly}
						></FormSelectChips>
					</Grid>
				</If>
				<If condition={getCanAnswer(M0063?.id, M0150Answer)}>
					<Grid item xs={12} sm={6}>
						<FormTextField
							control={control}
							name="M0063Answer"
							label={M0063?.shortName ?? ''}
							readOnly={formReadonly}
						></FormTextField>
					</Grid>
				</If>
				<If condition={getCanAnswer(M0065?.id, M0150Answer)}>
					<Grid item xs={12} sm={6}>
						<FormTextField
							control={control}
							name="M0065Answer"
							label={M0065?.shortName ?? ''}
							readOnly={formReadonly}
						></FormTextField>
					</Grid>
				</If>
				<If condition={getCanAnswer(M0150_specify?.id, M0150Answer)}>
					<Grid item xs={12} sm={12}>
						<FormTextField
							control={control}
							name="M0150SpecifyAnswer"
							label={M0150_specify?.shortName ?? ''}
							readOnly={formReadonly}
						></FormTextField>
					</Grid>
				</If>
			</Grid>
			<If condition={!fields.length}>
				<AddAndRemoveButtons
					handleAdd={() =>
						void append({
							payorSourceName: '',
							payorSourceType: undefined,
							payorSourceIdentifier: '',
						})
					}
					addText={addButtonText}
					readOnly={!!formReadonly}
					shouldShowAdd={true}
					shouldShowRemove={false}
				/>
			</If>
			{fields.map((_, index) => (
				<Box key={index}>
					<Grid container spacing={2} key={`PayorSources-${index}`}>
						<Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
							<Typography>Payor Source {index + 1}</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormTextField
								control={control}
								name={`PayorSources[${index}].payorSourceName` as Path<CreatePatientInput>}
								label="Payor Source Name"
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormSelect
								control={control}
								name={`PayorSources[${index}].payorSourceType` as Path<CreatePatientInput>}
								label="Payor Source Type"
								freeSolo
								options={payorSourceTypeOptions.map((v) => ({
									value: v,
									label: v,
								}))}
								readOnly={formReadonly}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormTextField
								control={control}
								name={`PayorSources[${index}].payorSourceIdentifier` as Path<CreatePatientInput>}
								label="Payor Source Id"
								readOnly={formReadonly}
							/>
						</Grid>
					</Grid>
					<Box mt={1}>
						<AddAndRemoveButtons
							handleAdd={() =>
								void append({
									payorSourceName: '',
									payorSourceType: undefined,
									payorSourceIdentifier: '',
								})
							}
							handleRemove={() => void remove(index)}
							addText={addButtonText}
							readOnly={!!formReadonly}
							shouldShowAdd={index === fields.length - 1}
						/>
					</Box>
				</Box>
			))}
		</Stack>
	);
};
