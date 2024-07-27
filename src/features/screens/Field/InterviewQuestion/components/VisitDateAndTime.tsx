import { AccessTime, DateRange } from '@mui/icons-material';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEffectOnce } from '~/common/hooks/useEffectOnce';
import { formatDate, formatHour } from '~/common/utils/dateFormat';
import { FormDatePicker, FormTimePicker } from '~/features/ui/form-inputs';
import { FULL_HEIGHT_MINUS_NAVBAR } from '~/features/ui/layouts/TopNav';
import { SaveNurseInterviewSOCQuestionInput } from '~/server/api/routers/interviewQuestion/interviewQuestion.inputs';
import type { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import theme from '~/styles/theme';
import { InterviewState, SliderQuestions } from '../common/interviewState';
import { DateInputBackForward } from './AnswerQuestion/DateInputBackForward';
import { getSocDateTimeData, saveInterviewSetupQuestion } from './SyncInterviewSetupQuestions';

type Props = {
	patientData: PatientWithJoins;
};

const HEADER_HEIGHT = 160;
const TRANSITION_DURATION = 300;

export const VisitDateAndTime = ({ patientData }: Props) => {
	const router = useRouter();
	const [selectedTab, setSelectedTab] = useState(0);
	const editDate = router.query.editDate as string;

	const formData = useForm({
		defaultValues: {
			SOCVisitDate: patientData.SOCVisitDate ?? new Date(),
			SOCVisitTime: patientData.SOCVisitTime ?? new Date(),
		},
	});
	useEffectOnce(() => {
		getSocDateTimeData(patientData.id)
			.then((data) => {
				if (data.SOCVisitDate) formData.setValue('SOCVisitDate', data.SOCVisitDate);
				if (data.SOCVisitTime) formData.setValue('SOCVisitTime', data.SOCVisitTime);
			})
			.catch(console.error);
	});

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		setSelectedTab(newValue);
	};

	const updatePatient = async () => {
		const { SOCVisitDate, SOCVisitTime } = formData.getValues();
		const dataToUpdate: SaveNurseInterviewSOCQuestionInput = {
			patientId: patientData.id,
			SOCVisitDate,
			SOCVisitTime,
		};
		await saveInterviewSetupQuestion(dataToUpdate);
	};
	const onForward = async () => {
		await updatePatient();
		const query = { ...router.query };
		delete query.editDate;

		void router.push({
			pathname: router.pathname,
			query: {
				...query,
				interviewState: InterviewState.DISTANCE_AND_MINUTES,
				currentQuestion: SliderQuestions.MINUTES_WITH_PATIENT,
			},
		});
	};

	const timeWatch = formData.watch('SOCVisitTime');
	const formattedTime = formatHour(timeWatch);
	const dateWatch = formData.watch('SOCVisitDate');
	const formattedDate = formatDate(dateWatch);

	return (
		<Box height={FULL_HEIGHT_MINUS_NAVBAR} overflow="clip">
			<Box
				p={3}
				sx={{
					translate: editDate === 'true' ? `0 -${HEADER_HEIGHT + 10}px` : undefined,
					transition: `translate ${TRANSITION_DURATION}ms`,
				}}
				maxWidth="480px"
				mx="auto"
			>
				<Box height={HEADER_HEIGHT}>
					<Typography mb={2} sx={{ typography: { xs: 'h4' } }} fontWeight="bold">
						Update date and time of visit, if needed.
					</Typography>
					<Typography variant="body2">If date and time are correct, just click next arrow.</Typography>
				</Box>

				<Typography
					sx={{
						typography: { xs: 'h1', sm: 'h2', md: 'h3', color: `${theme.palette.primary.main} !important` },
					}}
					fontWeight="bold"
				>
					{formattedTime}
				</Typography>
				<Typography sx={{ typography: { xs: 'h4', md: 'h5' } }} mb={2} fontWeight="bold">
					{formattedDate}
				</Typography>
				<Box
					sx={{
						visibility: editDate === 'true' ? 'visible' : 'hidden',
						opacity: editDate === 'true' ? 1 : 0,
						transition: `visibility ${TRANSITION_DURATION}ms, opacity ${TRANSITION_DURATION}ms`,
					}}
				>
					<Stack width="100%">
						<Tabs value={selectedTab} onChange={handleTabChange} variant="fullWidth">
							<Tab icon={<DateRange />} aria-label="date" />
							<Tab icon={<AccessTime />} aria-label="time" />
						</Tabs>
						<Stack justifyContent="center">
							{selectedTab === 0 ? (
								<FormDatePicker control={formData.control} name="SOCVisitDate" inlinePicker />
							) : (
								<FormTimePicker control={formData.control} name="SOCVisitTime" label="" inlinePicker />
							)}
						</Stack>
					</Stack>
				</Box>
			</Box>
			<DateInputBackForward disableBack disableForward={!dateWatch || !timeWatch} onForward={onForward} />
		</Box>
	);
};
