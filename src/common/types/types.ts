import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '../../server/prisma';

export type PartialExceptFor<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type RpaApiContext = {
	req: NextApiRequest;
	res: NextApiResponse;
	db: Prisma;
};
