/**
 * I tipi della liturgia e il modello che la pagina usa, senza nulla che serva
 * a recuperarla.
 *
 * Stavano tutti in `scraper_liturgy.ts`, che pero' importa cheerio: siccome
 * `use_lecture.tsx` faceva `new LiturgyOfDay(...)` — un uso di valore, non di
 * tipo — il bundler tirava dentro anche lo scraper, e con lui cheerio e
 * parse5, ~123 kB gzip di parser HTML spediti a ogni visitatore per costruire
 * un oggetto di quattro campi. Lo scraping resta server-side, dove serve.
 */

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

export interface Salmo {
  title: string;
  chorus: string[] /* Array because there can be possibly more than one */;
  verses: string[];
}

export class LiturgyOfDay {
  firstLecture: Lettura;
  psalm: Salmo;
  secondLecture?: Lettura;
  gospel: Lettura;

  constructor(body: WebStructLiturgy) {
    this.firstLecture = body.firstLecture;
    this.psalm = body.psalm;
    this.secondLecture = body.secondLecture;
    this.gospel = body.gospel;
  }
}
