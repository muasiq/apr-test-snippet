import { Stack, Typography } from '@mui/material';
import { Control, UseFormGetValues } from 'react-hook-form';
import { RunBackTestForSuggestionsInput } from '../../../../server/api/routers/promptIteration/promptIteration.inputs';
import { CopyButton } from '../../../ui/buttons/CopyButton';
import { FormTextField } from '../../../ui/form-inputs';
import { LoadingButton } from '../../../ui/loading/LoadingButton';

type Props = {
	control: Control<RunBackTestForSuggestionsInput>;
	getValues: UseFormGetValues<RunBackTestForSuggestionsInput>;
	isLoading: boolean;
	onSubmit: () => void;
};
export const TemplateForm = ({ control, isLoading, onSubmit, getValues }: Props): JSX.Element => {
	const getClipboardText = () => {
		const { assessmentNumber, templateOverrides } = getValues();
		const forCopy = { assessmentNumber, ...templateOverrides };
		return JSON.stringify(forCopy, null, 2);
	};
	return (
		<Stack mt={4} direction={'column'} spacing={2}>
			<Stack direction={'row'} spacing={2}>
				<Typography variant="h6">Prompt Template</Typography>
				<CopyButton getTextToCopy={getClipboardText} />
			</Stack>
			<FormTextField control={control} name={'assessmentNumber'} label={'Assessment Number'} type={'text'} />
			<FormTextField
				control={control}
				name={'templateOverrides.codingInstructions'}
				label={'Coding Instructions'}
				type={'text'}
				multiline
			/>
			<FormTextField
				control={control}
				name={'templateOverrides.template'}
				label={'Template'}
				type={'text'}
				multiline
			/>
			<FormTextField
				control={control}
				name={'templateOverrides.alternateQuestionText'}
				label={'Question Text'}
				type={'text'}
				multiline
			/>
			<FormTextField control={control} name={'templateOverrides.hints'} label={'Hints'} type={'text'} multiline />
			<FormTextField
				control={control}
				name={'templateOverrides.examples'}
				label={'Examples'}
				type={'text'}
				multiline
			/>
			<LoadingButton label={'run'} isLoading={isLoading} onClick={onSubmit}></LoadingButton>
		</Stack>
	);
};
