import { NextApiRequest, NextApiResponse } from 'next';
import { runFailedJobs } from '../../../../server/cron-jobs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const { headers } = req;
	if (headers['x-cloudscheduler'] !== 'true') {
		res.status(403).send('Forbidden');
		return;
	}
	runFailedJobs();
	res.status(200).send('OK');
}
