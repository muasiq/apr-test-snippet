import { EventSchemas, Inngest } from 'inngest';
import { env } from '~/env.mjs';
import { EventPayload } from './events';

export const inngest = new Inngest({
	id: `apricot-${env.APRICOT_ENV}`,
	schemas: new EventSchemas().fromRecord<EventPayload>(),
	signingKey: env.INNGEST_SIGNING_KEY,
	eventKey: env.INNGEST_EVENT_KEY,
});
