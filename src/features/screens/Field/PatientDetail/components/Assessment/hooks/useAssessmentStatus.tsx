import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
} from 'react';
import { Group } from '~/assessments/types';
import { extractQuestionsFromGroup } from '~/assessments/util/lookupQuestionUtil';
import type { PatientWithJoins } from '~/server/api/routers/patient/patient.types';

export type QuestionState = {
	valueHasBeenEdited: boolean;
};

type Context = {
	patientData: PatientWithJoins | null;
	setPatientData: Dispatch<SetStateAction<PatientWithJoins | null>>;
	questionStateMap: Record<string, QuestionState>;
	setQuestionStateMap: Dispatch<SetStateAction<Record<string, QuestionState>>>;
	currentGroup: Group | null;
	setCurrentGroup: Dispatch<SetStateAction<Group | null>>;
	isReadonly: boolean;
	hasUnconfirmed: boolean;
	setIsReadonly: Dispatch<SetStateAction<boolean>>;
};

const AssessmentStatusContext = createContext<Context | null>(null);

export const useAssessmentStatus = () => {
	const ctx = useContext(AssessmentStatusContext);

	if (!ctx) throw new Error('useAssessmentStatus must be used within a AssessmentStatusProvider');

	const {
		hasUnconfirmed,
		patientData,
		setPatientData,
		isReadonly,
		setIsReadonly,
		questionStateMap,
		setQuestionStateMap,
		currentGroup,
		setCurrentGroup,
	} = ctx;

	const setQuestionState = useCallback(
		(id: string, data: QuestionState) => {
			setQuestionStateMap((prev) => ({ ...prev, [id]: data }));
		},
		[setQuestionStateMap],
	);

	const clearQuestionStates = useCallback(() => {
		setQuestionStateMap({});
	}, [setQuestionStateMap]);

	return {
		questionStateMap,
		hasUnconfirmed,
		patientData,
		setPatientData,
		setQuestionState,
		clearQuestionStates,
		currentGroup,
		setCurrentGroup,
		isReadonly,
		setIsReadonly,
	};
};

export const AssessmentStatusProvider = ({ children }: { children: ReactNode }) => {
	const [patientData, setPatientData] = useState<PatientWithJoins | null>(null);
	const [questionStateMap, setQuestionStateMap] = useState<Record<string, QuestionState>>({});
	const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
	const [isReadonly, setIsReadonly] = useState(false);

	const hasUnconfirmed = useMemo(() => {
		if (!patientData) return false;
		if (!currentGroup) return Object.values(questionStateMap).some((state) => state.valueHasBeenEdited);

		const questions = extractQuestionsFromGroup(currentGroup, patientData);

		return questions.some((q) => {
			if (!q.id) return;
			const state = questionStateMap[q.id];
			return !isReadonly && state?.valueHasBeenEdited;
		});
	}, [currentGroup, questionStateMap, patientData, isReadonly]);

	useEffect(() => {
		setQuestionStateMap({});
	}, [currentGroup]);

	return (
		<AssessmentStatusContext.Provider
			value={{
				patientData,
				setPatientData,
				questionStateMap,
				setQuestionStateMap,
				currentGroup,
				setCurrentGroup,
				isReadonly,
				setIsReadonly,
				hasUnconfirmed,
			}}
		>
			{children}
		</AssessmentStatusContext.Provider>
	);
};
