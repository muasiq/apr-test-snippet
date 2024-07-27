import { NextApiRequest, NextApiResponse } from 'next';
// import { reminderToNurseJob } from '../../../../server/jobs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	// still need to make the template in sendgrid for this to start sending the reminder (and add the job to cron scheduler in gcp)
	res.status(500);
	// const { headers } = req;
	// if (headers['x-cloudscheduler'] !== 'true') {
	// 	res.status(403).send('Forbidden');
	// 	return;
	// }
	// await reminderToNurseJob();
	// res.status(200).send('OK');
}
