import { type CheerioAPI, load } from 'cheerio';

export interface WebStructLiturgy {
  firstLecture: Lettura;
  psalm: Salmo;
  secondLecture?: Lettura;
  gospel: Lettura;
}

export interface Lettura {
  title: string;
  verse: string;
  content: string;
}

interface Salmo {
  title: string;
  chorus: string[] /* Array because there can be possibly more than one */;
  verses: string[];
}

const fetchLiturgia = async (url: string): Promise<CheerioAPI> => {
  const data = await fetch(url);
  return load(await data.text());
};

const parseSalmo = ($: CheerioAPI): Salmo => {
  const tag =
    ".cci-liturgia-giorno-dettagli-content:icontains('Salmo responsoriale')";
  const verses = $(tag + ' > .cci-liturgia-giorno-section-content')
    .children('p:not(:empty)')
    .slice(1) // Skip rit
    .find('br')
    .replaceWith('\n')
    .end()
    .text()
    .split('R.');
  const title = $(tag + ' > .cci-liturgia-giorno-section-versetto').text();
  const chorus = $(tag + ' > .cci-liturgia-giorno-section-content')
    .children('p:not(:empty)')
    .first()
    .text();
  const all_chorus = chorus.split('Oppure:').map((x) => {
    x = x.trim();
    if (x.startsWith('R.')) {
      x = x.slice(2).trim();
    }
    return x;
  });

  return { title, chorus: all_chorus, verses };
};

const parseLecture = (
  $: CheerioAPI,
  lectureType: 'Prima lettura' | 'Seconda lettura' | 'Vangelo'
): Lettura | undefined => {
  let lect = '';
  const tag =
    ".cci-liturgia-giorno-dettagli-content:not(:icontains('Acclamazione al vangelo')):has(> .cci-liturgia-giorno-section-title:icontains('" +
    lectureType +
    "')) > .cci-liturgia-giorno-section-content";
  $(tag)
    .children('p')
    .find('br')
    .replaceWith('\n')
    .end()
    .each((i, el) => {
      lect += $(el).text() + '\n';
    });
  const lecture = lect.trim().split('\n');
  const title = lecture[0];
  const verse = lecture[1];
  let lett = lecture.slice(2).join('\n');
  if (lett.trim().endsWith('Parola di Dio.'))
    lett = lett.replace('Parola di Dio.', '');
  if (lett.trim().endsWith('Parola del Signore.'))
    lett = lett.replace('Parola del Signore.', '');
  if (lett.trim() === '') {
    return undefined;
  }
  return { title, verse, content: lett.trim() };
};

export const extractLiturgia = async (
  url: string
): Promise<WebStructLiturgy> => {
  const $ = await fetchLiturgia(url);
  const firstLecture = parseLecture($, 'Prima lettura');
  const secondLecture = parseLecture($, 'Seconda lettura');

  const psalm = parseSalmo($);
  const gospel = parseLecture($, 'Vangelo');

  if (firstLecture === undefined || gospel === undefined) {
    throw new Error('Lectures not found');
  }

  const out: WebStructLiturgy = { firstLecture, secondLecture, psalm, gospel };
  return out;
};

export class LiturgyOfDay {
  firstLecture: Lettura;
  psalm: Salmo;
  secondLecture?: Lettura;
  gospel: Lettura;

  constructor(body: WebStructLiturgy | any) {
    this.firstLecture = body.firstLecture;
    this.psalm = body.psalm;
    this.secondLecture = body.secondLecture;
    this.gospel = body.gospel;
  }
}
