import {
	Autocomplete,
	Button,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { SyntheticEvent, useState } from 'react';
import { Configuration } from '~/assessments/configurations';
import { lookupQuestion } from '~/assessments/util/lookupQuestionUtil';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';
import { api } from '~/common/utils/api';
import { PromptIterationTestMode } from '~/server/api/routers/promptIteration/promptIteration.inputs';
import { getAllQuestionsFilteredByGroup } from './util/suggestionAndChoiceUtils';

type Props = {
	configuration: Configuration;
	patientTestAmount: number;
	setPatientTestAmount: (value: number) => void;
	selectedPatientIds: number[];
	setSelectedPatientIds: (value: number[]) => void;
	patientTestMode: PromptIterationTestMode;
	setPatientTestMode: (value: PromptIterationTestMode) => void;
};
export const SelectQuestionToPromptIterate = ({
	configuration,
	patientTestAmount,
	setPatientTestAmount,
	selectedPatientIds,
	setSelectedPatientIds,
	patientTestMode,
	setPatientTestMode,
}: Props) => {
	const { push } = useShallowRouterQuery();
	const [selectedHeading, setSelectedHeading] = useState<string>('');
	const [selectedQuestion, setSelectedQuestion] = useState<string>('');

	const { data: patientData } = api.patient.getPatientsByStatus.useQuery({
		status: PatientStatus.Complete,
	});

	const patientSelectOptions =
		patientData?.map((patient) => {
			return { label: `${patient.firstName} ${patient.lastName}`, value: patient.id };
		}) ?? [];
	const groups = configuration.qaConfig;
	const allQuestions = getAllQuestionsFilteredByGroup(configuration, selectedHeading);

	function handleSelectQuestion(source: string, assessmentNumber: string) {
		push({ source, assessmentNumber });
	}

	function handleHeadingChange(_event: SyntheticEvent, value: string | null) {
		setSelectedHeading(value ?? '');
		setSelectedQuestion('');
	}

	function handleQuestionChange(_event: SyntheticEvent, value?: string | null) {
		if (value) {
			const selectedQuestionObj = groups
				.flatMap((group) =>
					group.subGroups.flatMap((subGroup) =>
						subGroup.questions.find((q) => q.id && lookupQuestion(q.id, configuration).text === value),
					),
				)
				.find(Boolean);

			if (selectedQuestionObj?.source && selectedQuestionObj.id) {
				setSelectedQuestion(value);
				handleSelectQuestion(selectedQuestionObj.source, selectedQuestionObj.id);
			}
		} else {
			setSelectedQuestion('');
		}
	}

	function handleChangePatientMode() {
		const currentMode = patientTestMode;
		if (currentMode === PromptIterationTestMode.NUMBER_SELECT) {
			setPatientTestMode(PromptIterationTestMode.PATIENT_SELECT);
		} else {
			setPatientTestMode(PromptIterationTestMode.NUMBER_SELECT);
		}
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} sm={12} md={6}>
				<Stack spacing={2}>
					<Stack spacing={1}>
						<Typography variant="h6">Filter questions by group</Typography>
						<Autocomplete
							options={groups.map((group) => group.heading)}
							value={selectedHeading}
							onChange={handleHeadingChange}
							renderInput={(params) => <TextField {...params} label="Group Filter" />}
						/>
					</Stack>
					<Stack spacing={1}>
						<Typography variant="h6">Search for a question</Typography>
						<Autocomplete
							options={allQuestions}
							value={selectedQuestion}
							onChange={handleQuestionChange}
							renderInput={(params) => <TextField {...params} label="Question" />}
						/>
					</Stack>
				</Stack>
			</Grid>
			<Grid item xs={12} sm={12} md={6}>
				<Stack spacing={2}>
					{patientTestMode === PromptIterationTestMode.PATIENT_SELECT ? (
						<>
							<Typography variant="h6">Select patients to backtest against</Typography>
							<Autocomplete
								multiple
								id="select-patients-autocomplete"
								options={patientSelectOptions}
								getOptionLabel={(option) => option.label}
								value={patientSelectOptions.filter((option) =>
									selectedPatientIds.includes(option.value),
								)}
								onChange={(event, newValue) => {
									setSelectedPatientIds(newValue.map((option) => option.value));
								}}
								renderInput={(params) => <TextField {...params} label="Patients" />}
								isOptionEqualToValue={(option, value) => option.value === value.value}
							/>
						</>
					) : (
						<>
							<Typography variant="h6">Select amount of recent patients to backtest against</Typography>
							<FormControl fullWidth>
								<InputLabel id="patient-test-amount-label">Patient Test Amount</InputLabel>
								<Select
									labelId="patient-test-amount-label"
									value={patientTestAmount}
									onChange={(e) => setPatientTestAmount(Number(e.target.value))}
									label="Patient Test Amount"
								>
									<MenuItem value={1}>1</MenuItem>
									<MenuItem value={5}>5</MenuItem>
									<MenuItem value={10}>10</MenuItem>
									<MenuItem value={15}>15</MenuItem>
									<MenuItem value={20}>20</MenuItem>
								</Select>
							</FormControl>
						</>
					)}
					<Button variant="outlined" onClick={handleChangePatientMode}>
						{patientTestMode === PromptIterationTestMode.PATIENT_SELECT
							? 'Switch to number select'
							: 'Switch to patient select'}
					</Button>
				</Stack>
			</Grid>
		</Grid>
	);
};
