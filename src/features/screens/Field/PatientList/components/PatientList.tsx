import { Box, Typography } from '@mui/material';
import { Patient } from '@prisma/client';
import { useCallback, useEffect, useRef } from 'react';
import { PatientListCard } from '~/features/ui/cards/Patient/PatientListCard';
import { PatientListLoadingCard } from '../../../../ui/cards/Patient/PatientListLoadingCard';
import { PatientSearchState } from './PatientListHeader';

type Props = {
	data: Patient[] | undefined;
	isLoading: boolean;
	search: PatientSearchState;
	fetchNextPage: () => void;
	hasNextPage: boolean | undefined;
};
export const PatientList = ({ data, search, fetchNextPage, hasNextPage, isLoading }: Props) => {
	const observer = useRef<IntersectionObserver | null>(null);

	const lastPatientRef = useCallback(
		(node: Element | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((entries) => {
				if (entries[0]?.isIntersecting && hasNextPage) {
					fetchNextPage();
				}
			});
			if (node) observer.current.observe(node);
		},
		[fetchNextPage, hasNextPage],
	);

	useEffect(() => {
		return () => {
			if (observer.current) {
				observer.current.disconnect();
			}
		};
	}, []);

	return (
		<Box
			sx={{
				border: '2px solid #FFF',
				borderRadius: '16px',
				transform: search.searchSelected ? 'translateY(20px)' : 'translateY(0)',
				transition: 'transform 0.3s, margin-top 0.3s',
				mt: search.searchSelected ? 0 : '-60px',
			}}
		>
			{isLoading ? (
				<>
					{Array.from(Array(20).keys()).map((_, index) => (
						<PatientListLoadingCard key={index} />
					))}
				</>
			) : data?.length === 0 ? (
				<Box textAlign={'center'}>
					<Typography variant="h6">No Results</Typography>
				</Box>
			) : (
				<>
					{data?.map((patient, index) => {
						if (index === data.length - 1) {
							return (
								<PatientListCard
									isLastCard={true}
									ref={lastPatientRef}
									key={patient.id}
									patient={patient}
								/>
							);
						} else {
							return <PatientListCard key={patient.id} patient={patient} />;
						}
					})}
				</>
			)}
		</Box>
	);
};
