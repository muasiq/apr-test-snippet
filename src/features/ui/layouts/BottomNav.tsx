import { CalendarToday } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PageWithNavBar } from '~/common/utils/showNavBars';
import { PeopleFilled } from '../icons/PeopleFilled';
import { getColor } from './util/BottomNavUtil';

export const BottomNav = () => {
	const router = useRouter();

	const [value, setValue] = useState<string>(router.pathname);

	const handleChange = (_event: React.SyntheticEvent, newValue: PageWithNavBar) => {
		void router.push(newValue);
	};

	useEffect(() => {
		setValue(router.pathname as PageWithNavBar);
	}, [router.pathname]);

	const isFieldApp = router.pathname.startsWith('/field');

	if (!isFieldApp) return null;

	return (
		<>
			<Box height={'125px'} /> {/* buffer spacing */}
			<BottomNavigation
				showLabels
				value={value}
				onChange={handleChange}
				sx={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 1,
					borderRadius: '16px 16px 0 0',
					boxShadow:
						'0px 2px 4px -1px rgba(0, 0, 0, 0.20), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);',
					height: '72px',
				}}
			>
				<BottomNavigationAction
					label="Schedule"
					sx={{ color: getColor(value, PageWithNavBar.SCHEDULE) }}
					value={PageWithNavBar.SCHEDULE}
					icon={<CalendarToday sx={{ color: getColor(value, PageWithNavBar.SCHEDULE) }} />}
				/>

				<BottomNavigationAction
					label="Patient List"
					sx={{ color: getColor(value, PageWithNavBar.PATIENT_LIST) }}
					value={PageWithNavBar.PATIENT_LIST}
					icon={<PeopleFilled customColor={getColor(value, PageWithNavBar.PATIENT_LIST)} />}
				/>
			</BottomNavigation>
		</>
	);
};
