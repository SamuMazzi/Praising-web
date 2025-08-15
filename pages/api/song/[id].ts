import path from 'path';
import { promises as fs } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSingleSong } from '@/logic/local_logic';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const song = getSingleSong(Array.isArray(id!) ? id!.at(0)! : id!);
  if (!song) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  res.setHeader('Cache-Control', 'public, max-age=7200, stale-while-revalidate=119');

  const dirRelativeToPublicFolder = 'accordi';
  const dir = path.resolve('./public', dirRelativeToPublicFolder);
  const fileContents = await fs.readFile(dir + '/' + song.nameFile, 'utf8');
  res.status(200).json(fileContents);
}
