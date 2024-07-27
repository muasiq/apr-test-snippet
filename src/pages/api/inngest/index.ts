import { serve } from 'inngest/next';
import { functions, inngest } from '~/server/jobs';

export default serve({
	client: inngest,
	functions,
});
