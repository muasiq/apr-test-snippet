import { PageWithNavBar } from '~/common/utils/showNavBars';
import theme from '~/styles/theme';

export const getColor = (currentValue: string, itemValue: PageWithNavBar) => {
	return currentValue === itemValue.toString() ? theme.palette.primary.main : theme.palette.heading;
};
