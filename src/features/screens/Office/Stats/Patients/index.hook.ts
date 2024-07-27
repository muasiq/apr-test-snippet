import { PatientStatus } from '@prisma/client';
import { addDays, subDays } from 'date-fns';
import { groupBy, map, orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import { api } from '../../../../../common/utils/api';
import { formatDate } from '../../../../../common/utils/dateFormat';
import { PatientStats } from '../../../../../server/api/routers/stats/stats.types';

export const usePatientsScreen = () => {
	const defaultFrom = subDays(new Date(), 7);
	const defaultTo = addDays(new Date(), 7);
	const [dateRange, updateDateRange] = useState<[Date | null, Date | null]>([defaultFrom, defaultTo]);
	const [from, to] = dateRange;
	const { data: patientStats, isLoading: isLoadingPatientStats } = api.stats.getPatientStats.useQuery({
		from: from ?? defaultFrom,
		to: to ?? defaultTo,
	});

	const { dataset } = useMemo(() => {
		return formatStatsForBarChart(patientStats);
	}, [patientStats]);

	return { isLoadingPatientStats, dateRange, updateDateRange, dataset };
};

const formatStatsForBarChart = (patientStats?: PatientStats[]) => {
	if (!patientStats) return { dataset: [] };
	const groupedByDate = groupBy(patientStats, 'SOCVisitDay');
	const dataset = map(groupedByDate, (val, key) => {
		return addStatusCountValues(val, key);
	});
	const orderedDataset = orderBy(dataset, 'SOCDatetime');
	return { dataset: orderedDataset };
};

const addStatusCountValues = (val: PatientStats[], key: string) => {
	const statuses = Object.values(PatientStatus);
	const statusesWithCount = statuses.map((s) => {
		return {
			status: s,
			count: val.find((v) => v.status === s)?._count ?? 0,
		};
	});
	const statusObject = Object.fromEntries(statusesWithCount.map((s) => [s.status, s.count]));

	return {
		SOCDatetime: new Date(key),
		SOCDate: formatDate(key),
		...statusObject,
	};
};
