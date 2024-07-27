import { RouterOutputs } from '~/common/utils/api';
import { ApricotAccordionPatientDetailItem } from './ApricotAccordionPatientDetailItem';

type Props = {
	patients: RouterOutputs['patient']['getScheduleView'] | undefined;
};
export const ApricotAccordionPatientDetailList = ({ patients }: Props) => {
	return (
		<>
			{patients?.map((patient, index, array) => (
				<ApricotAccordionPatientDetailItem
					isLast={index === array.length - 1}
					key={patient.id}
					patient={patient}
				/>
			))}
		</>
	);
};
