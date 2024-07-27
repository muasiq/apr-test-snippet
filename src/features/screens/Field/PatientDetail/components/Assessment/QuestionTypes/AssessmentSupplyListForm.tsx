import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import { uniq } from 'lodash';
import { Fragment, useEffect, useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { api } from '~/common/utils/api';
import { FormAutocomplete, FormSelect, FormTextField } from '~/features/ui/form-inputs';
import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';
import { Configuration } from '../../../../../../../assessments/configurations';
import { AssessmentQuestion } from '../../../../../../../assessments/types';
import { SchemaAssessmentAnswer, Supply } from '../../../../../../../common/types/AssessmentSuggestionAndChoice';
import { If } from '../../../../../../ui/util/If';
import { resolveAnswer } from '../../../common/util/resolveAnswer';
import { AddAndRemoveButtons } from '../../AddAndRemoveButtons';
import { useAssessmentQuestion } from '../hooks/useAssessmentQuestion';
import { WithCopyWrapper } from './WithCopyWrapper';
import { QuestionWrapper } from './Wrapper/QuestionWrapper';

type Props = {
	question: AssessmentQuestion;
	patientId: number;
	readOnly: boolean;
	configuration: Configuration;
	additionalDropdownConfigurationInput: AdditionalDropdownConfigurationInput;
	answer?: SchemaAssessmentAnswer;
	print?: boolean;
};

export function AssessmentSupplyListForm({
	question,
	patientId,
	answer,
	readOnly,
	print,
	configuration,
	additionalDropdownConfigurationInput,
}: Props): JSX.Element {
	const resolvedAnswer = resolveAnswer(answer, {
		choice: {
			supplies: [],
		},
	});
	const assessmentHook = useAssessmentQuestion(question, patientId, resolvedAnswer, answer, false, undefined);
	const { control, handleSubmit, onError, watch, onSubmit, getValues, setValue, canCopy, isLoading, reset } =
		assessmentHook;
	const supplies = watch('checkedResponse.choice.supplies');
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'checkedResponse.choice.supplies',
	});

	const suppliesQuery = api.organization.getSupplies.useQuery({ page: 0, pageSize: 2000 });
	const categories = useMemo(
		() => uniq(suppliesQuery.data?.list?.map((item) => item.category) ?? []),
		[suppliesQuery.data],
	);

	useEffect(() => {
		reset({
			...getValues(),
			checkedResponse: resolveAnswer(answer as unknown as SchemaAssessmentAnswer, {
				choice: {
					supplies: [{ category: '', orderNeeded: 'Yes' }],
				},
			}),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(answer)]);

	useEffect(() => {
		supplies.forEach((supply: Supply, index: number) => {
			if (supply.orderNeeded === 'No') {
				setValue(`checkedResponse.choice.supplies.${index}.package`, null);
				setValue(`checkedResponse.choice.supplies.${index}.deliveryMethod`, null);
				setValue(`checkedResponse.choice.supplies.${index}.quantityToOrder`, null);
				setValue(`checkedResponse.choice.supplies.${index}.quantityDelivered`, null);
			}
		});
	}, [supplies, setValue]);

	const handleAddForm = (supply?: Supply) => {
		if (supply) append(supply);
		else append({ category: '', orderNeeded: 'Yes' });
	};

	const handleRemoveForm = (index: number) => {
		remove(index);
	};

	function getPackageList(category: string) {
		return (
			suppliesQuery.data?.list
				?.filter((item) => item.category === category)
				.map((item) => ({ id: item.package, label: item.package })) ?? []
		);
	}

	return (
		<>
			<QuestionWrapper
				question={question}
				allAnswers={[]}
				configuration={configuration}
				additionalDropdownConfigurationInput={additionalDropdownConfigurationInput}
				loadingGuess={assessmentHook.isLoadingGuess}
				formValue={''}
				patientId={patientId}
				explanation={''}
				id={question.id}
				questionText={question.text}
				onAccept={() => handleSubmit(onSubmit, onError)()}
				loading={isLoading}
				loadingText={"Preparing Supply list now. Please wait, you'll be able to review and edit the list soon."}
				hasValue={assessmentHook.hasValue}
				hasError={false}
				onRetrySuggestion={() => null}
				hasAcceptedValue={assessmentHook.hasAcceptedValue}
				valueHasBeenEdited={assessmentHook.valueHasBeenEdited}
				readOnly={readOnly}
				print={print}
			>
				{!fields.length && (
					<Stack alignItems={'start'} spacing={2}>
						<Alert
							severity={assessmentHook.hasAcceptedValue ? 'success' : 'warning'}
							icon={false}
							sx={{ width: '100%' }}
						>
							<Typography variant={'body1'}>No supplies added</Typography>
						</Alert>
						<AddAndRemoveButtons
							shouldShowRemove={false}
							addText="Add Supply"
							handleAdd={() => handleAddForm()}
							shouldShowAdd={!assessmentHook.isLoadingGuess}
							readOnly={readOnly}
						/>
					</Stack>
				)}

				<Stack>
					<If condition={!assessmentHook.hasAcceptedValue && !!fields.length}>
						<Box mb={2}>
							<Typography variant="h6">
								A draft of the patient&apos;s supply list is below. Please thoroughly review the list
								and make any edits needed.
							</Typography>
						</Box>
					</If>
					{fields.map((field, index) => (
						<Fragment key={field.id}>
							<Grid container spacing={2}>
								<Grid item xs={6}>
									<WithCopyWrapper
										canCopy={canCopy}
										getValue={() => getValues(`checkedResponse.choice.supplies.${index}.category`)}
									>
										<FormAutocomplete
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.supplies.${index}.category`}
											label="Supply"
											options={categories.map((category) => ({
												id: category,
												label: category,
											}))}
										/>
									</WithCopyWrapper>
								</Grid>

								<Grid item xs={6}>
									<FormSelect
										readOnly={readOnly}
										disabled={isLoading}
										control={control}
										label="Order Needed?"
										name={`checkedResponse.choice.supplies.${index}.orderNeeded`}
										options={[
											{ label: 'Yes', value: 'Yes' },
											{ label: 'No', value: 'No' },
										]}
									/>
								</Grid>
								<If
									condition={
										getValues(`checkedResponse.choice.supplies.${index}.orderNeeded`) === 'Yes'
									}
								>
									<Grid item xs={6}>
										<WithCopyWrapper
											canCopy={canCopy}
											getValue={() =>
												getValues(`checkedResponse.choice.supplies.${index}.package`) ?? ''
											}
										>
											<FormAutocomplete
												readOnly={readOnly}
												disabled={isLoading}
												control={control}
												name={`checkedResponse.choice.supplies.${index}.package`}
												label="Supply Package"
												options={getPackageList(
													watch(`checkedResponse.choice.supplies.${index}.category`),
												)}
											/>
										</WithCopyWrapper>
									</Grid>
									<Grid item xs={6}>
										<WithCopyWrapper
											canCopy={canCopy}
											getValue={() =>
												getValues(`checkedResponse.choice.supplies.${index}.deliveryMethod`) ??
												''
											}
										>
											<FormAutocomplete
												readOnly={readOnly}
												disabled={isLoading}
												control={control}
												name={`checkedResponse.choice.supplies.${index}.deliveryMethod`}
												label="Delivery Method"
												freeSolo
												options={additionalDropdownConfigurationInput.supplyDeliveryMethod.map(
													(item) => ({ id: item, label: item }),
												)}
											/>
										</WithCopyWrapper>
									</Grid>
									<Grid item xs={6}>
										<FormTextField
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.supplies.${index}.quantityToOrder`}
											label="Quantity to Order"
											type={'number'}
										/>
									</Grid>
									<Grid item xs={6}>
										<FormTextField
											readOnly={readOnly}
											disabled={isLoading}
											control={control}
											name={`checkedResponse.choice.supplies.${index}.quantityDelivered`}
											label="Quantity Delivered"
											type={'number'}
										/>
									</Grid>
								</If>
							</Grid>
							<Box mt={1} mb={2}>
								<AddAndRemoveButtons
									handleRemove={() => handleRemoveForm(index)}
									handleAdd={() => handleAddForm()}
									shouldShowAdd={index === fields.length - 1}
									readOnly={readOnly}
									addText="Add Supply"
								/>
							</Box>
						</Fragment>
					))}
				</Stack>
			</QuestionWrapper>
		</>
	);
}
