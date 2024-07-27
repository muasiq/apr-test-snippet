import { generateVisitNotes } from './functions/generateVisitNotes';
import { inngest } from './inngest';

export * from './events';
export const functions = [generateVisitNotes];

type Params = Parameters<typeof inngest.send>[0];
export async function sendEvent(props: Params) {
	return inngest.send(props);
}

export { inngest };
