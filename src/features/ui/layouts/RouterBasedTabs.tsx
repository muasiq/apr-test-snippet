import { Box, Tab, Tabs } from '@mui/material';
import { PropsWithChildren } from 'react';
import { useShallowRouterQuery } from '~/common/hooks/useShallowRouterQuery';

export type TabLabelValueRenderer = {
	value: string;
	label: string;
	renderer: () => JSX.Element;
};
export type TabOptions = TabLabelValueRenderer[];

type Props = {
	tabOptions: TabOptions;
	disableRipple?: boolean;
	hideTabsList?: boolean;
};

export function RouterBasedTabs({ tabOptions, disableRipple = false, hideTabsList = false }: Props) {
	const { replace, query } = useShallowRouterQuery();

	const { currentTab } = query as { currentTab: string };

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		replace({ currentTab: newValue });
	};

	return (
		<>
			{!hideTabsList && (
				<Tabs value={currentTab} onChange={handleTabChange} scrollButtons="auto" variant="scrollable">
					{tabOptions.map((tabOption) => (
						<Tab
							disableRipple={disableRipple}
							key={tabOption.value}
							value={tabOption.value}
							label={tabOption.label}
						/>
					))}
				</Tabs>
			)}
			<Box flexGrow={1} overflow={'auto'}>
				{tabOptions.map((tabOption) => (
					<TabPanelRenderer key={`${tabOption.value}-renderer`} value={currentTab} index={tabOption.value}>
						{tabOption.renderer()}
					</TabPanelRenderer>
				))}
			</Box>
		</>
	);
}

type TabPanelRendererProps = {
	value: string | undefined;
	index: string;
};
function TabPanelRenderer({ index, value, children }: PropsWithChildren<TabPanelRendererProps>) {
	if (value !== index) return null;
	return <Box p={2}>{children}</Box>;
}
