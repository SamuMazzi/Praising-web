import path from 'path';
import { promises as fs } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSingleSong } from '@/logic/local_logic';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query
    
    const song = getSingleSong(Array.isArray(id!) ? id!.at(0)! : id!)
    if (!song) {
        res.status(404).json({message: 'Not found'});
        return
    }
    const jsonDirectory = path.join(process.cwd(), 'accordi');
    const fileContents = await fs.readFile(jsonDirectory + '/' + song.name + '.crd', 'utf8');
    res.status(200).json(fileContents);
}