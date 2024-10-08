import path from 'path';
import { promises as fs } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSingleSong } from '@/logic/local_logic';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(404).json({});
}
