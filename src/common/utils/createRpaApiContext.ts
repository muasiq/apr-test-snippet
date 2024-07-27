import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../server/prisma';
import { RpaApiContext } from '../types/types';

export const createRpaApiContext = (req: NextApiRequest, res: NextApiResponse): RpaApiContext => {
	return {
		req,
		res,
		db: prisma,
	};
};
