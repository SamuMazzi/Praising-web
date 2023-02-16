import type { NextApiRequest, NextApiResponse } from 'next'
import cheerio from 'cheerio'
import axios from 'axios'

const fetchLiturgia = async (url: string) => {
    const { data } = await axios.get(url);
    return cheerio.load(data);
};

const extractLiturgia = async (url: string) => {
    const $ = await fetchLiturgia(url);
    const letture = $(".letture .lettura")
    .toArray()
    .map((elem) => $(elem).text().trim());
    console.log(letture)
    
    const salmo = $(".salmo .lettura").text().trim();
    const vangelo = $(".vangelo .lettura").text().trim();
    return { letture, salmo, vangelo };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { date } = req.query
    const url = `https://www.chiesacattolica.it/liturgia-del-giorno/?data-liturgia=${date}`;

    const out = await extractLiturgia(url)
    console.log(out)
    //{ letture, salmo, vangelo }

    res.status(200).json(out);
}